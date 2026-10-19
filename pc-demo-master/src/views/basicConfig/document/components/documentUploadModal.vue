<template>
  <CustomDialog :title="dialogTitle" v-model="show" size="xlarge" @close="handleDialogClose">
    <div class="document-upload-modal">
      <template v-if="isAddMode">
        <el-steps :active="currentStep" align-center finish-status="success" class="upload-steps">
          <el-step title="上传文件" description="设置受控类型与有效期" />
          <el-step title="设置关联项" description="配置位置或产品关联" />
        </el-steps>

        <div v-show="currentStep === 0" class="step-panel">
          <el-form
            ref="basicFormRef"
            :model="modalData"
            :rules="basicRules"
            label-width="120px"
            class="upload-form"
          >
            <div class="section-card">
              <div class="section-title">基础信息</div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="文档类型" prop="directoryName">
                    <el-input v-model="modalData.directoryName" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="文档上传流程" prop="flowId">
                    <el-select v-model="modalData.flowId" disabled placeholder="未配置上传流程">
                      <el-option
                        v-for="item in flowableList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.flowKey"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="上传新文件" prop="fileList">
                <UploadFile
                  v-model="modalData.fileList"
                  accept=".pdf,.png,.jpg,.docx,.doc,.xls,.xlsx"
                  :multiple="true"
                  :limit="100"
                >
                  <template #tip>
                    <div class="el-upload__tip tips">
                      支持格式：pdf、png、jpg、docx、doc、xls、xlsx
                    </div>
                  </template>
                </UploadFile>
              </el-form-item>
            </div>

            <div class="section-card">
              <div class="section-title">受控规则</div>
              <el-form-item label="受控类型" prop="controlType">
                <el-radio-group v-model="modalData.controlType">
                  <el-radio :label="1">正式</el-radio>
                  <el-radio :label="2">临时</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="生效时间" prop="effectiveTime">
                    <el-date-picker
                      v-model="modalData.effectiveTime"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DD HH:mm:00"
                      placeholder="请选择生效时间"
                      :disabled="modalData.controlType !== 1"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="截止有效日期" prop="expireDate">
                    <el-date-picker
                      v-model="modalData.expireDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择截止有效日期"
                      :disabled="modalData.controlType !== 2"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </div>

        <div v-show="currentStep === 1" class="step-panel relation-step-panel">
          <div class="section-card relation-tabs-card">
            <el-tabs v-model="activeRelationTab" stretch class="relation-tabs">
              <el-tab-pane name="location">
                <template #label>
                  <div class="tab-label">
                    <span>关联位置</span>
                    <span class="tab-count">{{ modalData.locationRelations.length }}</span>
                  </div>
                </template>

                <div class="tab-panel">
                  <div class="section-card">
                    <div class="section-head">
                      <div>
                        <div class="section-title">关联位置</div>
                        <div class="section-desc">支持关联区域、区域-生产单元、区域-生产单元-工位</div>
                      </div>
                    </div>

                    <div class="relation-layout">
                      <div class="relation-pane relation-pane-tree">
                        <div class="pane-toolbar">
                          <el-input
                            v-model="locationKeyword"
                            clearable
                            placeholder="搜索区域、生产单元、工位"
                            class="toolbar-field"
                          />
                          <div class="pane-actions">
                            <el-button type="primary" plain @click="addLocationRelations">加入已选</el-button>
                            <el-button @click="clearLocationChecked">清空勾选</el-button>
                          </div>
                        </div>
                        <div class="pane-meta">
                          已勾选 {{ locationCheckedCount }} 项，支持跨层级批量加入
                        </div>
                        <el-tree
                          ref="locationTreeRef"
                          :data="locationTreeOptions"
                          :props="locationTreeProps"
                          node-key="entityId"
                          show-checkbox
                          check-strictly
                          default-expand-all
                          class="location-tree"
                          empty-text="暂无位置数据"
                          :filter-node-method="filterLocationNode"
                          @check="updateLocationCheckedCount"
                        />
                      </div>

                      <div class="relation-pane">
                        <div class="pane-toolbar">
                          <div class="pane-title">已选位置</div>
                          <div class="pane-actions">
                            <el-button
                              type="danger"
                              plain
                              :disabled="!selectedLocationKeys.length"
                              @click="removeSelectedLocationRelations"
                            >
                              批量移除
                            </el-button>
                            <el-button
                              :disabled="!modalData.locationRelations.length"
                              @click="clearLocationRelations"
                            >
                              清空
                            </el-button>
                          </div>
                        </div>
                        <el-table
                          :key="locationRelationTableKey"
                          :data="locationRelationRows"
                          :row-key="getLocationRelationKey"
                          border
                          class="relation-table"
                          empty-text="暂无已选位置"
                          @selection-change="handleLocationSelectionChange"
                        >
                          <el-table-column type="selection" width="55" align="center" />
                          <el-table-column label="关联层级" width="120" align="center">
                            <template #default="{ row }">{{ getLocationRelationLevel(row) }}</template>
                          </el-table-column>
                          <el-table-column prop="areaName" label="区域" min-width="150" />
                          <el-table-column prop="productionUnitName" label="生产单元" min-width="160">
                            <template #default="{ row }">{{ row.productionUnitName || "-" }}</template>
                          </el-table-column>
                          <el-table-column prop="workstationName" label="工位" min-width="160">
                            <template #default="{ row }">{{ row.workstationName || "-" }}</template>
                          </el-table-column>
                          <el-table-column prop="pathNames" label="完整路径" min-width="260" show-overflow-tooltip>
                            <template #default="{ row }">{{ row.pathNames.join(" / ") }}</template>
                          </el-table-column>
                          <el-table-column label="操作" width="90" fixed="right" align="center">
                            <template #default="{ $index }">
                              <el-button link type="danger" @click="removeLocationRelation($index)">
                                删除
                              </el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane name="product">
                <template #label>
                  <div class="tab-label">
                    <span>关联产品</span>
                    <span class="tab-count">{{ modalData.productRelations.length }}</span>
                  </div>
                </template>

                <div class="tab-panel">
                  <div class="section-card">
                    <div class="section-head">
                      <div>
                        <div class="section-title">关联产品</div>
                        <div class="section-desc">按“产品 + 版本”成行展示，每个版本下支持多工序</div>
                      </div>
                      <el-button type="primary" plain @click="productDialogVisible = true">选择产品</el-button>
                    </div>

                    <el-table
                      :data="modalData.productRelations"
                      :row-key="getProductRelationKey"
                      border
                      class="relation-table"
                      empty-text="暂无关联产品"
                    >
                      <el-table-column prop="productCode" label="产品编号" min-width="140" />
                      <el-table-column prop="productName" label="产品名称" min-width="180" />
                      <el-table-column prop="specification" label="规格" min-width="160">
                        <template #default="{ row }">{{ row.specification || "-" }}</template>
                      </el-table-column>
                      <el-table-column prop="drawingNumber" label="图号" min-width="160">
                        <template #default="{ row }">{{ row.drawingNumber || "-" }}</template>
                      </el-table-column>
                      <el-table-column label="关联版本" min-width="140" align="center">
                        <template #default="{ row }">{{ row.techVersionNo || "-" }}</template>
                      </el-table-column>
                      <el-table-column label="已选工序数" width="110" align="center">
                        <template #default="{ row }">{{ getProductProcessCount(row) || "-" }}</template>
                      </el-table-column>
                      <el-table-column label="工序摘要" min-width="260" show-overflow-tooltip>
                        <template #default="{ row }">
                          {{ getProductProcessSummary(row) }}
                        </template>
                      </el-table-column>
                      <el-table-column label="关联模式" min-width="160">
                        <template #default="{ row }">
                          {{ isVersionProcessRelation(row) ? "产品-版本-工序" : "仅产品" }}
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="280" fixed="right" align="center">
                        <template #default="{ row, $index }">
                          <el-button link type="primary" @click="openProcessDialog(row)">
                            {{ isVersionProcessRelation(row) ? "编辑版本工序" : "设置版本工序" }}
                          </el-button>
                          <el-button link type="primary" @click="openProcessDialog(row, 'append')">
                            新增版本
                          </el-button>
                          <el-button link type="danger" @click="removeProductRelation($index)">
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </template>

      <template v-else>
        <el-steps
          v-if="!isRelationEditMode"
          :active="currentStep"
          align-center
          finish-status="success"
          class="upload-steps"
        >
          <el-step title="修订信息" description="上传新文件并设置受控规则" />
          <el-step title="设置关联项" description="配置位置或产品关联" />
        </el-steps>

        <div v-show="!isRelationEditMode && currentStep === 0" class="step-panel">
          <el-form
            ref="reviseFormRef"
            :model="modalData"
            :rules="reviseRules"
            label-width="120px"
            class="upload-form"
          >
            <div class="section-card">
              <div class="section-title">修订信息</div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="当前版本">
                    <el-input v-model="modalData.version" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="文档修订流程">
                    <el-select v-model="modalData.reviseProcessDefineId" disabled placeholder="未配置修订流程">
                      <el-option
                        v-for="item in flowableList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.flowKey"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="文档名称">
                    <el-input v-model="modalData.fileName" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="源文档">
                    <el-input v-model="modalData.sourceName" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="上传新文件" prop="fileList">
                <UploadFile
                  v-model="modalData.fileList"
                  accept=".pdf,.png,.jpg,.docx,.doc,.xls,.xlsx"
                  :limit="1"
                >
                  <template #tip>
                    <div class="el-upload__tip tips">
                      支持格式：pdf、png、jpg、docx、doc、xls、xlsx
                    </div>
                  </template>
                </UploadFile>
              </el-form-item>
            </div>

            <div class="section-card">
              <div class="section-title">受控规则</div>
              <el-form-item label="受控类型" prop="controlType">
                <el-radio-group v-model="modalData.controlType" disabled>
                  <el-radio :label="1">正式</el-radio>
                  <el-radio :label="2">临时</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-row :gutter="16">
                <el-col v-if="modalData.controlType === 1" :span="12">
                  <el-form-item label="生效时间" prop="effectiveTime">
                    <el-date-picker
                      v-model="modalData.effectiveTime"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DD HH:mm:00"
                      placeholder="请选择生效时间"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
                <el-col v-if="modalData.controlType === 2" :span="12">
                  <el-form-item label="截止有效日期" prop="expireDate">
                    <el-date-picker
                      v-model="modalData.expireDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择截止有效日期"
                      disabled
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="section-card">
              <div class="section-title">变更说明</div>
              <el-form-item label="变更原因" prop="changeReason">
                <el-input
                  v-model="modalData.changeReason"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  placeholder="请输入本次修订原因"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>

        <div v-show="isRelationEditMode || currentStep === 1" class="step-panel relation-step-panel">
          <div class="section-card relation-tabs-card">
            <el-tabs v-model="activeRelationTab" stretch class="relation-tabs">
              <el-tab-pane name="location">
                <template #label>
                  <div class="tab-label">
                    <span>关联位置</span>
                    <span class="tab-count">{{ modalData.locationRelations.length }}</span>
                  </div>
                </template>

                <div class="tab-panel">
                  <div class="section-card">
                    <div class="section-head">
                      <div>
                        <div class="section-title">关联位置</div>
                        <div class="section-desc">支持关联区域、区域-生产单元、区域-生产单元-工位</div>
                      </div>
                    </div>

                    <div class="relation-layout">
                      <div class="relation-pane relation-pane-tree">
                        <div class="pane-toolbar">
                          <el-input
                            v-model="locationKeyword"
                            clearable
                            placeholder="搜索区域、生产单元、工位"
                            class="toolbar-field"
                          />
                          <div class="pane-actions">
                            <el-button type="primary" plain @click="addLocationRelations">加入已选</el-button>
                            <el-button @click="clearLocationChecked">清空勾选</el-button>
                          </div>
                        </div>
                        <div class="pane-meta">
                          已勾选 {{ locationCheckedCount }} 项，支持跨层级批量加入
                        </div>
                        <el-tree
                          ref="locationTreeRef"
                          :data="locationTreeOptions"
                          :props="locationTreeProps"
                          node-key="entityId"
                          show-checkbox
                          check-strictly
                          default-expand-all
                          class="location-tree"
                          empty-text="暂无位置数据"
                          :filter-node-method="filterLocationNode"
                          @check="updateLocationCheckedCount"
                        />
                      </div>

                      <div class="relation-pane">
                        <div class="pane-toolbar">
                          <div class="pane-title">已选位置</div>
                          <div class="pane-actions">
                            <el-button
                              type="danger"
                              plain
                              :disabled="!selectedLocationKeys.length"
                              @click="removeSelectedLocationRelations"
                            >
                              批量移除
                            </el-button>
                            <el-button
                              :disabled="!modalData.locationRelations.length"
                              @click="clearLocationRelations"
                            >
                              清空
                            </el-button>
                          </div>
                        </div>
                        <el-table
                          :key="locationRelationTableKey"
                          :data="locationRelationRows"
                          :row-key="getLocationRelationKey"
                          border
                          class="relation-table"
                          empty-text="暂无已选位置"
                          @selection-change="handleLocationSelectionChange"
                        >
                          <el-table-column type="selection" width="55" align="center" />
                          <el-table-column label="关联层级" width="120" align="center">
                            <template #default="{ row }">{{ getLocationRelationLevel(row) }}</template>
                          </el-table-column>
                          <el-table-column prop="areaName" label="区域" min-width="150" />
                          <el-table-column prop="productionUnitName" label="生产单元" min-width="160">
                            <template #default="{ row }">{{ row.productionUnitName || "-" }}</template>
                          </el-table-column>
                          <el-table-column prop="workstationName" label="工位" min-width="160">
                            <template #default="{ row }">{{ row.workstationName || "-" }}</template>
                          </el-table-column>
                          <el-table-column prop="pathNames" label="完整路径" min-width="260" show-overflow-tooltip>
                            <template #default="{ row }">{{ row.pathNames.join(" / ") }}</template>
                          </el-table-column>
                          <el-table-column label="操作" width="90" fixed="right" align="center">
                            <template #default="{ $index }">
                              <el-button link type="danger" @click="removeLocationRelation($index)">
                                删除
                              </el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane name="product">
                <template #label>
                  <div class="tab-label">
                    <span>关联产品</span>
                    <span class="tab-count">{{ modalData.productRelations.length }}</span>
                  </div>
                </template>

                <div class="tab-panel">
                  <div class="section-card">
                    <div class="section-head">
                      <div>
                        <div class="section-title">关联产品</div>
                        <div class="section-desc">按“产品 + 版本”成行展示，每个版本下支持多工序</div>
                      </div>
                      <el-button type="primary" plain @click="productDialogVisible = true">选择产品</el-button>
                    </div>

                    <el-table
                      :data="modalData.productRelations"
                      :row-key="getProductRelationKey"
                      border
                      class="relation-table"
                      empty-text="暂无关联产品"
                    >
                      <el-table-column prop="productCode" label="产品编号" min-width="140" />
                      <el-table-column prop="productName" label="产品名称" min-width="180" />
                      <el-table-column prop="specification" label="规格" min-width="160">
                        <template #default="{ row }">{{ row.specification || "-" }}</template>
                      </el-table-column>
                      <el-table-column prop="drawingNumber" label="图号" min-width="160">
                        <template #default="{ row }">{{ row.drawingNumber || "-" }}</template>
                      </el-table-column>
                      <el-table-column label="关联版本" min-width="140" align="center">
                        <template #default="{ row }">{{ row.techVersionNo || "-" }}</template>
                      </el-table-column>
                      <el-table-column label="已选工序数" width="110" align="center">
                        <template #default="{ row }">{{ getProductProcessCount(row) || "-" }}</template>
                      </el-table-column>
                      <el-table-column label="工序摘要" min-width="260" show-overflow-tooltip>
                        <template #default="{ row }">
                          {{ getProductProcessSummary(row) }}
                        </template>
                      </el-table-column>
                      <el-table-column label="关联模式" min-width="160">
                        <template #default="{ row }">
                          {{ isVersionProcessRelation(row) ? "产品-版本-工序" : "仅产品" }}
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="280" fixed="right" align="center">
                        <template #default="{ row, $index }">
                          <el-button link type="primary" @click="openProcessDialog(row)">
                            {{ isVersionProcessRelation(row) ? "编辑版本工序" : "设置版本工序" }}
                          </el-button>
                          <el-button link type="primary" @click="openProcessDialog(row, 'append')">
                            新增版本
                          </el-button>
                          <el-button link type="danger" @click="removeProductRelation($index)">
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button v-if="!isRelationEditMode && currentStep === 1" @click="currentStep = 0">上一步</el-button>
      <el-button
        v-if="!isRelationEditMode && currentStep === 0"
        type="primary"
        v-preventReClick="[handleCurrentNextStep]"
      >
        下一步
      </el-button>
      <el-button v-else type="primary" v-preventReClick="[saveOrUpdateFileHandle]">确定</el-button>
    </template>
  </CustomDialog>

  <SelectProductDialog
    v-model="productDialogVisible"
    multiple
    :selected-row-keys="[]"
    @success="handleProductSelected"
  />

  <CustomDialog
    v-model="processDialogVisible"
    title="设置版本工序"
    size="large"
    @close="resetProcessDialog"
  >
    <div class="process-dialog">
      <div class="process-panel">
        <div class="process-title">已发布版本</div>
        <el-input
          v-model="routeKeyword"
          clearable
          placeholder="搜索工艺路线编号或版本号"
          class="process-search"
        />
        <el-table
          ref="routeTableRef"
          v-loading="routeLoading"
          :data="filteredRoutes"
          border
          highlight-current-row
          row-key="id"
          @current-change="handleRouteCurrentChange"
        >
          <el-table-column prop="no" label="工艺路线编号" min-width="160" />
          <el-table-column label="版本号" width="120" align="center">
            <template #default="{ row }">{{ row.techVersion?.version || "-" }}</template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="180">
            <template #default="{ row }">{{ row.remarks || "-" }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="process-panel">
        <div class="process-title">工序号</div>
        <div class="pane-toolbar process-toolbar">
          <el-input
            v-model="processKeyword"
            clearable
            placeholder="搜索工序号或工序名称"
            class="toolbar-field"
          />
          <div class="pane-actions">
            <el-button :disabled="!selectedRoute || !filteredProcesses.length" @click="selectAllProcesses">
              全选
            </el-button>
            <el-button :disabled="!selectedProcesses.length" @click="clearProcessSelection">
              清空勾选
            </el-button>
          </div>
        </div>
        <div class="pane-meta">
          {{ selectedRoute ? `当前已勾选 ${selectedProcesses.length} 道工序` : "请先选择版本" }}
        </div>
        <el-table
          ref="processTableRef"
          v-loading="processLoading"
          :data="filteredProcesses"
          border
          row-key="id"
          @selection-change="handleProcessSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" reserve-selection />
          <el-table-column prop="processSerial" label="工序号" width="120" align="center" />
          <el-table-column prop="name" label="工序名称" min-width="180" />
          <el-table-column prop="techNo" label="编号" min-width="140" />
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="processDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmProcessDialog">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script lang="ts" setup>
import { ElMessage, type ElTable, type ElTree, type FormInstance, type FormRules } from "element-plus"

import { getTechProcessList, queryCraftRoutePageList,type TechProcessInfo } from "@/api/craft"
import { type IFileDirectory } from "@/api/directory"
import { requestCreateDocument, updateDocument, updateDocumentRelations } from "@/api/fileResource"
import { requestFlowDefinitionList } from "@/api/flowable"
import { queryFactoryModelTree } from "@/api/fm"
import { type IProductModelListItem } from "@/api/product"
import CustomDialog from "@/components/CustomDialog/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import type { ICraftRouteItem } from "@/types/base-info/craftRoute"
import type { IFactoryModelTreeNode } from "@/types/base-info/factory-model"
import type {
  IFileLocationRelation,
  IFileProductRelation,
  IFileResourcePageItem
} from "@/types/base-info/file"
import type { IFile } from "@/types/base-info/implement-config"
import type { IFlowableDefinitionItem } from "@/types/personal/flow"

enum EnumType {
  ADD = "add",
  REVISE = "revise",
  EDIT_RELATIONS = "editRelations"
}

type IModalData = {
  fileName: string
  directoryName: string
  version: string
  flowId: string
  reviseProcessDefineId: string
  sourceName: string
  fileList: IFile[]
  controlType: number
  effectiveTime: string
  expireDate: string
  changeReason: string
  locationRelations: IFileLocationRelation[]
  productRelations: IFileProductRelation[]
}

const createDefaultModalData = (): IModalData => ({
  fileName: "",
  directoryName: "",
  version: "",
  flowId: "",
  reviseProcessDefineId: "",
  sourceName: "",
  fileList: [],
  controlType: 1,
  effectiveTime: "",
  expireDate: "",
  changeReason: "",
  locationRelations: [],
  productRelations: []
})

const props = defineProps<{
  currentDirectory?: IFileDirectory
  currentFile?: IFileResourcePageItem
}>()

const emit = defineEmits<{
  (e: "onOk"): void
}>()

const basicFormRef = ref<FormInstance>()
const reviseFormRef = ref<FormInstance>()

const show = ref(false)
const modalStatus = ref<EnumType>(EnumType.ADD)
const currentStep = ref(0)
const modalData = ref<IModalData>(createDefaultModalData())
const flowableList = ref<IFlowableDefinitionItem[]>([])

const locationTreeRef = shallowRef<InstanceType<typeof ElTree>>()
const routeTableRef = shallowRef<InstanceType<typeof ElTable>>()
const processTableRef = shallowRef<InstanceType<typeof ElTable>>()
const locationTreeOptions = ref<IFactoryModelTreeNode[]>([])
const locationRelationMap = ref(new Map<string, IFileLocationRelation>())
const locationKeyword = ref("")
const selectedLocationKeys = ref<string[]>([])
const selectedLocationPath = ref<string[]>([])

const productDialogVisible = ref(false)
const processDialogVisible = ref(false)
const activeRelationTab = ref("location")
const currentProductRelationKey = ref("")
const processDialogProductBase = ref<IFileProductRelation>()
const availableRoutes = ref<ICraftRouteItem[]>([])
const availableProcesses = ref<TechProcessInfo[]>([])
const selectedRoute = ref<ICraftRouteItem>()
const selectedProcesses = ref<TechProcessInfo[]>([])
const routeKeyword = ref("")
const processKeyword = ref("")
const routeLoading = ref(false)
const processLoading = ref(false)

const cloneLocationRelations = (relations: IFileLocationRelation[] = []) =>
  relations.map((item) => ({
    areaId: String(item.areaId || ""),
    areaName: String(item.areaName || ""),
    productionUnitId: String(item.productionUnitId || ""),
    productionUnitName: String(item.productionUnitName || ""),
    workstationId: String(item.workstationId || ""),
    workstationName: String(item.workstationName || ""),
    pathIds: [...(item.pathIds || [])].map((id) => String(id)),
    pathNames: [...(item.pathNames || [])].map((name) => String(name))
  }))

const getNowMinuteTimestamp = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  return now.getTime()
}

const getDateTimeTimestamp = (value: string) => {
  if (!value) return 0
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const timestamp = new Date(normalized).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const validateEffectiveTimeField = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (modalData.value.controlType !== 1) {
    callback()
    return
  }

  if (!value) {
    callback(new Error("请选择生效时间"))
    return
  }

  const selectedTimestamp = getDateTimeTimestamp(value)
  if (!selectedTimestamp) {
    callback(new Error("生效时间格式不正确"))
    return
  }

  if (selectedTimestamp < getNowMinuteTimestamp()) {
    callback(new Error("生效时间不能早于当前时间"))
    return
  }

  callback()
}

const dialogTitle = computed(() => {
  if (isAddMode.value) return "上传新文档"
  if (isRelationEditMode.value) return "修改关联项"
  return "文件修订"
})
const isAddMode = computed(() => modalStatus.value === EnumType.ADD)
const isRelationEditMode = computed(() => modalStatus.value === EnumType.EDIT_RELATIONS)
const selectedProductKeys = computed(() =>
  Array.from(new Set(modalData.value.productRelations.map((item) => item.productId).filter(Boolean)))
)
const locationRelationRows = computed(() =>
  modalData.value.locationRelations.map((item) => ({
    ...item,
    pathIds: [...item.pathIds],
    pathNames: [...item.pathNames]
  }))
)
const locationRelationTableKey = computed(() =>
  locationRelationRows.value.map((item) => getLocationRelationKey(item)).join("|")
)
const locationCheckedCount = ref(0)
const filteredRoutes = computed(() => {
  const keyword = routeKeyword.value.trim().toLowerCase()
  if (!keyword) return availableRoutes.value
  return availableRoutes.value.filter((item) => {
    const version = String(item.techVersion?.version || "")
    return [item.no, version, item.remarks].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(keyword)
    )
  })
})
const filteredProcesses = computed(() => {
  const keyword = processKeyword.value.trim().toLowerCase()
  if (!keyword) return availableProcesses.value
  return availableProcesses.value.filter((item) =>
    [item.processSerial, item.name, item.techNo].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(keyword)
    )
  )
})

const locationTreeProps = {
  label: "entityName",
  value: "entityId",
  children: "children"
}

const basicRules: FormRules<IModalData> = {
  fileList: [
    {
      validator: (_rule, value: IFile[], callback) => {
        if (!value?.length) {
          callback(new Error("请上传文件"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  controlType: [{ required: true, message: "请选择受控类型", trigger: "change" }],
  effectiveTime: [
    {
      validator: validateEffectiveTimeField,
      trigger: "change"
    }
  ],
  expireDate: [
    {
      validator: (_rule, value: string, callback) => {
        if (modalData.value.controlType === 2 && !value) {
          callback(new Error("请选择截止有效日期"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ]
}

const reviseRules: FormRules<IModalData> = {
  fileList: [
    {
      validator: (_rule, value: IFile[], callback) => {
        if (!value?.length) {
          callback(new Error("请上传新文件"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  effectiveTime: [
    {
      validator: validateEffectiveTimeField,
      trigger: "change"
    }
  ]
}

onBeforeMount(() => {
  getFlowDefineOptions()
})

watch(
  () => modalData.value.controlType,
  (value) => {
    if (value === 1) {
      modalData.value.expireDate = ""
      return
    }
    modalData.value.effectiveTime = ""
  }
)

watch(
  () => props.currentDirectory,
  (val) => {
    if (!val) return
    modalData.value.directoryName = val.directoryName || ""
    modalData.value.flowId = val.processDefineId || ""
    modalData.value.reviseProcessDefineId = val.reviseProcessDefineId || ""
  },
  { immediate: true }
)

watch(
  () => show.value,
  async (visible) => {
    if (!visible) {
      basicFormRef.value?.resetFields()
      reviseFormRef.value?.resetFields()
      return
    }

    currentStep.value = 0
    applyBaseDirectoryInfo()
    await loadLocationTree()

    if (isAddMode.value) {
      return
    }

    modalData.value = {
      ...createDefaultModalData(),
      directoryName: props.currentDirectory?.directoryName || props.currentFile?.directoryName || "",
      flowId: props.currentFile?.processDefineId || props.currentDirectory?.processDefineId || "",
      reviseProcessDefineId:
        props.currentFile?.reviseProcessDefineId || props.currentDirectory?.reviseProcessDefineId || "",
      fileName: props.currentFile?.fileName || "",
      version: props.currentFile?.version || "",
      sourceName: props.currentFile?.sourceName || "",
      controlType: Number(props.currentFile?.controlType || 1),
      effectiveTime: String(props.currentFile?.effectiveTime || ""),
      expireDate: String(props.currentFile?.expireDate || ""),
      changeReason: String(props.currentFile?.changeReason || ""),
      locationRelations: cloneLocationRelations(props.currentFile?.locationRelations || []),
      productRelations: normalizeProductRelations(props.currentFile?.productRelations || [])
    }
  }
)

watch(
  () => locationKeyword.value,
  (value) => {
    locationTreeRef.value?.filter(value)
  }
)

watch(
  () => filteredProcesses.value,
  () => {
    if (!processDialogVisible.value) return
    void syncProcessSelection()
  }
)

const applyBaseDirectoryInfo = () => {
  modalData.value.directoryName = props.currentDirectory?.directoryName || ""
  modalData.value.flowId = props.currentDirectory?.processDefineId || ""
  modalData.value.reviseProcessDefineId = props.currentDirectory?.reviseProcessDefineId || ""
}

const handleDialogClose = () => {
  resetModalData()
}

const resetModalData = () => {
  modalData.value = createDefaultModalData()
  applyBaseDirectoryInfo()
  currentStep.value = 0
  activeRelationTab.value = "location"
  locationKeyword.value = ""
  selectedLocationKeys.value = []
  locationCheckedCount.value = 0
  locationTreeRef.value?.setCheckedKeys([])
  productDialogVisible.value = false
  resetProcessDialog()
}

const resetProcessDialog = () => {
  processDialogVisible.value = false
  currentProductRelationKey.value = ""
  processDialogProductBase.value = undefined
  availableRoutes.value = []
  availableProcesses.value = []
  selectedRoute.value = undefined
  selectedProcesses.value = []
  routeKeyword.value = ""
  processKeyword.value = ""
  routeTableRef.value?.setCurrentRow(undefined)
  processTableRef.value?.clearSelection()
  routeLoading.value = false
  processLoading.value = false
}

const buildLocationRelationMap = (
  nodes: IFactoryModelTreeNode[],
  parentIds: string[] = [],
  parentNames: string[] = [],
  bucket = new Map<string, IFileLocationRelation>()
) => {
  nodes.forEach((node) => {
    const currentId = String(node.entityId)
    const pathIds = [...parentIds, currentId]
    const pathNames = [...parentNames, node.entityName]
    bucket.set(currentId, formatLocationRelation(pathIds, pathNames))
    if (node.children?.length) {
      buildLocationRelationMap(node.children, pathIds, pathNames, bucket)
    }
  })
  return bucket
}

const LOCATION_LEVEL_TAGS = ["productionArea", "productionUnit", "workstation"]

const filterLocationTree = (nodes: IFactoryModelTreeNode[]): IFactoryModelTreeNode[] => {
  return nodes
    .map((node) => {
      const children = filterLocationTree(node.children || [])
      const levelTag = String(node.levelTag || node.propertyVO?.levelTag || "")
      if (LOCATION_LEVEL_TAGS.includes(levelTag)) {
        return {
          ...node,
          children
        }
      }
      if (children.length) {
        return children
      }
      return null
    })
    .flat()
    .filter(Boolean) as IFactoryModelTreeNode[]
}

const loadLocationTree = async () => {
  const data = await queryFactoryModelTree({
    isEnable: true
  })
  locationTreeOptions.value = filterLocationTree(data || [])
  locationRelationMap.value = buildLocationRelationMap(locationTreeOptions.value)
  locationCheckedCount.value = 0
  await nextTick()
  locationTreeRef.value?.filter(locationKeyword.value)
}

const formatLocationRelation = (pathIds: string[], pathNames?: string[]) => {
  const relationPathNames =
    pathNames ||
    pathIds
      .map((id) => locationRelationMap.value.get(String(id))?.pathNames.slice(-1)[0] || "")
      .filter((name) => !!name)
  const targetIds = pathIds.slice(-3)
  const targetNames = relationPathNames.slice(-3)
  return {
    areaId: targetIds[0] || "",
    areaName: targetNames[0] || "",
    productionUnitId: targetIds[1] || "",
    productionUnitName: targetNames[1] || "",
    workstationId: targetIds[2] || "",
    workstationName: targetNames[2] || "",
    pathIds,
    pathNames: relationPathNames
  } satisfies IFileLocationRelation
}

const addLocationRelation = () => {
  if (!selectedLocationPath.value?.length) {
    ElMessage.warning("请先选择关联位置")
    return
  }

  const relation = formatLocationRelation(selectedLocationPath.value.map((item) => String(item)))
  const exists = modalData.value.locationRelations.some(
    (item) => item.pathIds.join("-") === relation.pathIds.join("-")
  )
  if (exists) {
    ElMessage.warning("该位置已关联")
    return
  }

  modalData.value.locationRelations.push(relation)
  selectedLocationPath.value = []
}

const removeLocationRelation = (index: number) => {
  modalData.value = {
    ...modalData.value,
    locationRelations: modalData.value.locationRelations.filter((_, itemIndex) => itemIndex !== index)
  }
}

const getLocationRelationKey = (relation: IFileLocationRelation) => relation.pathIds.join("/")

const isLocationCovered = (parent: IFileLocationRelation, child: IFileLocationRelation) => {
  if (parent.pathIds.length > child.pathIds.length) return false
  return parent.pathIds.every((id, index) => String(id) === String(child.pathIds[index]))
}

const mergeLocationRelations = (relations: IFileLocationRelation[]) => {
  return [...relations]
    .sort((a, b) => a.pathIds.length - b.pathIds.length)
    .reduce<IFileLocationRelation[]>((bucket, relation) => {
      if (
        bucket.some(
          (item) =>
            getLocationRelationKey(item) === getLocationRelationKey(relation) ||
            isLocationCovered(item, relation)
        )
      ) {
        return bucket
      }

      return [
        ...bucket.filter((item) => !isLocationCovered(relation, item)),
        {
          ...relation,
          pathIds: [...relation.pathIds],
          pathNames: [...relation.pathNames]
        }
      ]
    }, [])
}

const filterLocationNode = (keyword: string, data: IFactoryModelTreeNode, _node?: unknown) => {
  const text = keyword.trim().toLowerCase()
  if (!text) return true
  return String(data.entityName || "")
    .toLowerCase()
    .includes(text)
}

const clearLocationChecked = () => {
  locationTreeRef.value?.setCheckedKeys([])
  locationCheckedCount.value = 0
}

const getCheckedLocationIds = () => {
  const checkedNodes =
    (locationTreeRef.value?.getCheckedNodes(false, false) as IFactoryModelTreeNode[] | undefined) || []
  const checkedNodeIds = checkedNodes.map((item) => String(item.entityId || "")).filter(Boolean)
  if (checkedNodeIds.length) {
    return Array.from(new Set(checkedNodeIds))
  }

  return ((locationTreeRef.value?.getCheckedKeys(false) as (string | number)[] | undefined) || []).map((item) =>
    String(item)
  )
}

const updateLocationCheckedCount = () => {
  locationCheckedCount.value = getCheckedLocationIds().length
}

const addLocationRelations = () => {
  const checkedRelations = getCheckedLocationIds()
    .map((id) => locationRelationMap.value.get(id))
    .filter(Boolean) as IFileLocationRelation[]

  if (!checkedRelations.length) {
    ElMessage.warning("请先勾选关联位置")
    return
  }

  const nextRelations = mergeLocationRelations([...modalData.value.locationRelations, ...checkedRelations])
  const beforeKeys = modalData.value.locationRelations.map(getLocationRelationKey).sort().join("|")
  const afterKeys = nextRelations.map(getLocationRelationKey).sort().join("|")
  if (beforeKeys === afterKeys) {
    ElMessage.warning("所选位置已包含在已选结果中")
    return
  }

  modalData.value = {
    ...modalData.value,
    locationRelations: nextRelations
  }
  clearLocationChecked()
  ElMessage.success("关联位置已更新")
}

const handleLocationSelectionChange = (rows: IFileLocationRelation[]) => {
  selectedLocationKeys.value = rows.map((item) => getLocationRelationKey(item))
}

const removeSelectedLocationRelations = () => {
  if (!selectedLocationKeys.value.length) return
  const keySet = new Set(selectedLocationKeys.value)
  modalData.value = {
    ...modalData.value,
    locationRelations: modalData.value.locationRelations.filter(
      (item) => !keySet.has(getLocationRelationKey(item))
    )
  }
  selectedLocationKeys.value = []
}

const clearLocationRelations = () => {
  modalData.value = {
    ...modalData.value,
    locationRelations: []
  }
  selectedLocationKeys.value = []
}

const getLocationRelationLevel = (relation: IFileLocationRelation) => {
  if (relation.workstationId) return "工位"
  if (relation.productionUnitId) return "生产单元"
  return "区域"
}
const createBaseProductRelation = (
  item: Pick<IFileProductRelation, "productId" | "productCode" | "productName" | "specification" | "drawingNumber">
): IFileProductRelation => ({
  productId: String(item.productId || ""),
  productCode: String(item.productCode || ""),
  productName: String(item.productName || ""),
  specification: item.specification || "",
  drawingNumber: item.drawingNumber || ""
})

const getRelationProcessIds = (relation: IFileProductRelation) => {
  const ids = (relation.processIds || []).map((item) => String(item)).filter(Boolean)
  if (ids.length) return ids
  return relation.processId ? [String(relation.processId)] : []
}

const getRelationProcessNames = (relation: IFileProductRelation) => {
  const names = (relation.processNames || []).map((item) => String(item)).filter(Boolean)
  if (names.length) return names
  return relation.processName ? [String(relation.processName)] : []
}

const getRelationProcessSerials = (relation: IFileProductRelation) => {
  const serials = (relation.processSerials || []).map((item) => String(item)).filter(Boolean)
  if (serials.length) return serials
  return relation.processSerial ? [String(relation.processSerial)] : []
}

const hasProcessRelation = (relation: IFileProductRelation) => getRelationProcessIds(relation).length > 0

const isVersionProcessRelation = (relation: IFileProductRelation) =>
  !!relation.techVersionId && hasProcessRelation(relation)

const isBaseProductRelation = (relation: IFileProductRelation) =>
  !relation.techVersionId && !hasProcessRelation(relation)

const getProductRelationKey = (relation: IFileProductRelation) =>
  `${relation.productId}::${relation.techVersionId || "base"}`

const sortProductRelations = (relations: IFileProductRelation[]) =>
  [...relations].sort((a, b) => {
    const productCompare = String(a.productCode || a.productName || "").localeCompare(
      String(b.productCode || b.productName || "")
    )
    if (productCompare) return productCompare

    const typeCompare = Number(Boolean(a.techVersionId)) - Number(Boolean(b.techVersionId))
    if (typeCompare) return typeCompare

    return String(a.techVersionNo || "").localeCompare(String(b.techVersionNo || ""))
  })

const normalizeProductRelations = (relations: IFileProductRelation[] = []) => {
  const relationMap = new Map<string, IFileProductRelation>()

  relations.forEach((item) => {
    const baseRelation = createBaseProductRelation(item)
    if (!baseRelation.productId) return

    const processIds = getRelationProcessIds(item)
    const processNames = getRelationProcessNames(item)
    const processSerials = getRelationProcessSerials(item)
    const normalizedRelation: IFileProductRelation = {
      ...baseRelation,
      craftRouteId: String(item.craftRouteId || ""),
      techVersionId: String(item.techVersionId || ""),
      techVersionNo: String(item.techVersionNo || ""),
      processIds,
      processNames,
      processSerials,
      processId: processIds[0] || "",
      processName: processNames[0] || "",
      processSerial: processSerials[0] || ""
    }

    relationMap.set(getProductRelationKey(normalizedRelation), normalizedRelation)
  })

  const versionProductIds = new Set(
    [...relationMap.values()].filter((item) => isVersionProcessRelation(item)).map((item) => item.productId)
  )

  return sortProductRelations(
    [...relationMap.values()].filter(
      (item) => !(isBaseProductRelation(item) && versionProductIds.has(item.productId))
    )
  )
}

const getProductProcessCount = (relation: IFileProductRelation) => getRelationProcessIds(relation).length

const getProductProcessSummary = (relation: IFileProductRelation) => {
  const serials = getRelationProcessSerials(relation)
  const names = getRelationProcessNames(relation)
  const labels = getRelationProcessIds(relation).map((_id, index) => {
    const serial = serials[index]
    const name = names[index]
    if (serial && name) return `${serial} / ${name}`
    return serial || name || "-"
  })

  if (!labels.length) return "-"
  if (labels.length <= 3) return labels.join("，")
  return `${labels.slice(0, 3).join("，")} +${labels.length - 3}`
}

const syncProcessSelection = async () => {
  await nextTick()
  processTableRef.value?.clearSelection()
  const selectedIdSet = new Set(selectedProcesses.value.map((item) => String(item.id)))
  filteredProcesses.value.forEach((item) => {
    if (selectedIdSet.has(String(item.id))) {
      processTableRef.value?.toggleRowSelection(item, true)
    }
  })
}

const clearProcessSelection = async () => {
  selectedProcesses.value = []
  await nextTick()
  processTableRef.value?.clearSelection()
}

const selectAllProcesses = async () => {
  const selectedMap = new Map<string, TechProcessInfo>()
  selectedProcesses.value.forEach((item) => selectedMap.set(String(item.id), item))
  filteredProcesses.value.forEach((item) => selectedMap.set(String(item.id), item))
  selectedProcesses.value = availableProcesses.value.filter((item) => selectedMap.has(String(item.id)))
  await syncProcessSelection()
}

const handleProcessSelectionChange = (rows: TechProcessInfo[]) => {
  const visibleIdSet = new Set(filteredProcesses.value.map((item) => String(item.id)))
  const selectedMap = new Map<string, TechProcessInfo>()
  selectedProcesses.value
    .filter((item) => !visibleIdSet.has(String(item.id)))
    .forEach((item) => selectedMap.set(String(item.id), item))
  rows.forEach((item) => selectedMap.set(String(item.id), item))
  selectedProcesses.value = availableProcesses.value.filter((item) => selectedMap.has(String(item.id)))
}

const handleProductSelected = (rows: IProductModelListItem[]) => {
  const selectedIds = new Set(modalData.value.productRelations.map((item) => item.productId))

  rows.forEach((item) => {
    const productId = String(item.id)

    modalData.value.productRelations.push(
      createBaseProductRelation({
        productId,
        productCode: item.code,
        productName: item.name,
        specification: item.specification,
        drawingNumber: item.drawingNumber
      })
    )
    selectedIds.add(productId)
  })

  modalData.value.productRelations = sortProductRelations(modalData.value.productRelations)
}

const removeProductRelation = (index: number) => {
  modalData.value.productRelations.splice(index, 1)
}

const getCurrentProductRelation = () =>
  modalData.value.productRelations.find(
    (item) => getProductRelationKey(item) === currentProductRelationKey.value
  )

const openProcessDialog = async (row: IFileProductRelation, mode: "edit" | "append" = "edit") => {
  currentProductRelationKey.value = mode === "edit" ? getProductRelationKey(row) : ""
  processDialogProductBase.value = createBaseProductRelation(row)
  processDialogVisible.value = true
  routeLoading.value = true
  selectedRoute.value = undefined
  selectedProcesses.value = []
  routeKeyword.value = ""
  processKeyword.value = ""
  availableProcesses.value = []

  try {
    const res = await queryCraftRoutePageList({
      pageQuery: {
        pageNum: 1,
        pageSize: 200
      },
      queryParam: {
        publishStatus: 2,
        exactProductNo: row.productCode,
        queryProductNo: row.productCode
      }
    })
    availableRoutes.value = (res.records || []).filter(
      (item) =>
        Number(item.publishStatus) === 2 && String(item.productModel?.code || "") === row.productCode
    )

    const current = mode === "edit" ? getCurrentProductRelation() : undefined
    if (current?.techVersionId) {
      const defaultRoute = availableRoutes.value.find(
        (item) =>
          String(item.techVersion?.id || item.techVersionId || "") === String(current.techVersionId)
      )
      if (defaultRoute) {
        await nextTick()
        routeTableRef.value?.setCurrentRow(defaultRoute)
        await handleRouteCurrentChange(defaultRoute)
      }
    }
  } finally {
    routeLoading.value = false
  }

  if (!availableRoutes.value.length) {
    ElMessage.warning("当前产品暂无已发布工艺路线")
  }
}

const handleRouteCurrentChange = async (row?: ICraftRouteItem) => {
  selectedRoute.value = row
  selectedProcesses.value = []
  availableProcesses.value = []
  await nextTick()
  processTableRef.value?.clearSelection()
  if (!row) return

  processLoading.value = true
  try {
    const techVersionId = String(row.techVersion?.id || row.techVersionId || "")
    availableProcesses.value = await getTechProcessList(techVersionId)
    const current = getCurrentProductRelation()
    if (current?.techVersionId && String(current.techVersionId) === techVersionId) {
      const selectedIdSet = new Set(getRelationProcessIds(current))
      selectedProcesses.value = availableProcesses.value.filter((item) =>
        selectedIdSet.has(String(item.id))
      )
    }
  } finally {
    processLoading.value = false
  }
  await syncProcessSelection()
}

const confirmProcessDialog = () => {
  if (!selectedRoute.value) {
    ElMessage.warning("请选择已发布版本")
    return
  }
  if (!selectedProcesses.value.length) {
    ElMessage.warning("请选择工序号")
    return
  }
  if (!processDialogProductBase.value?.productId) {
    resetProcessDialog()
    return
  }

  const nextRelation: IFileProductRelation = {
    ...createBaseProductRelation(processDialogProductBase.value),
    craftRouteId: String(selectedRoute.value.id),
    techVersionId: String(selectedRoute.value.techVersion?.id || selectedRoute.value.techVersionId || ""),
    techVersionNo: String(selectedRoute.value.techVersion?.version || ""),
    processIds: selectedProcesses.value.map((item) => String(item.id)),
    processNames: selectedProcesses.value.map((item) => item.name),
    processSerials: selectedProcesses.value.map((item) => item.processSerial),
    processId: String(selectedProcesses.value[0]?.id || ""),
    processName: selectedProcesses.value[0]?.name || "",
    processSerial: selectedProcesses.value[0]?.processSerial || ""
  }

  const productId = processDialogProductBase.value.productId
  const nextKey = getProductRelationKey(nextRelation)
  const nextRelations = modalData.value.productRelations.filter((item) => {
    const relationKey = getProductRelationKey(item)
    if (currentProductRelationKey.value && relationKey === currentProductRelationKey.value) {
      return false
    }
    if (item.productId === productId && isBaseProductRelation(item)) {
      return false
    }
    return true
  })

  const duplicateIndex = nextRelations.findIndex((item) => getProductRelationKey(item) === nextKey)
  if (duplicateIndex > -1) {
    nextRelations.splice(duplicateIndex, 1, nextRelation)
  } else {
    nextRelations.push(nextRelation)
  }

  modalData.value.productRelations = sortProductRelations(nextRelations)
  resetProcessDialog()
}

const validateRelationStep = () => {
  if (
    !modalData.value.locationRelations.length &&
    !modalData.value.productRelations.length
  ) {
    ElMessage.warning("请至少配置一种关联项")
    return false
  }

  const productModeMap = new Map<string, Set<"base" | "version">>()
  const productVersionKeys = new Set<string>()

  const hasInvalidProduct = modalData.value.productRelations.some((item) => {
    const relationType = isVersionProcessRelation(item) ? "version" : "base"
    const modeSet = productModeMap.get(item.productId) || new Set<"base" | "version">()
    modeSet.add(relationType)
    productModeMap.set(item.productId, modeSet)

    if (isVersionProcessRelation(item)) {
      const relationKey = getProductRelationKey(item)
      if (productVersionKeys.has(relationKey)) {
        return true
      }
      productVersionKeys.add(relationKey)
    }

    return (!!item.techVersionId && !hasProcessRelation(item)) || (!item.techVersionId && hasProcessRelation(item))
  })
  if (hasInvalidProduct) {
    ElMessage.warning("关联产品只能保存为仅产品或产品-版本-工序")
    return false
  }

  const hasModeConflict = [...productModeMap.values()].some(
    (modes) => modes.has("base") && modes.has("version")
  )
  if (hasModeConflict) {
    ElMessage.warning("同一产品不能同时保留仅产品和产品-版本-工序")
    return false
  }

  return true
}

const validateForm = async (formRef?: FormInstance) => {
  if (!formRef) return false
  try {
    await formRef.validate()
    return true
  } catch (_error) {
    return false
  }
}

const handleNextStep = async () => {
  const valid = await validateForm(basicFormRef.value)
  if (!valid) return
  activeRelationTab.value = "location"
  currentStep.value = 1
}

const handleReviseNextStep = async () => {
  const valid = await validateForm(reviseFormRef.value)
  if (!valid) return
  activeRelationTab.value = "location"
  currentStep.value = 1
}

const handleCurrentNextStep = async () => {
  if (isAddMode.value) {
    await handleNextStep()
    return
  }
  await handleReviseNextStep()
}

const getFlowDefineOptions = async () => {
  flowableList.value = await requestFlowDefinitionList()
}

const saveOrUpdateFileHandle = async () => {
  if (!show.value) return

  if (isRelationEditMode.value) {
    if (!validateRelationStep()) return

    await updateDocumentRelations({
      id: props.currentFile?.id,
      locationRelations: cloneLocationRelations(modalData.value.locationRelations),
      productRelations: normalizeProductRelations(modalData.value.productRelations)
    })
    ElMessage.success("关联项修改成功")
  } else if (!isAddMode.value) {
    const valid = await validateForm(reviseFormRef.value)
    if (!valid) return
    if (!validateRelationStep()) return

    await updateDocument({
      directoryId:
        props.currentDirectory?.id && props.currentDirectory.id != 0
          ? props.currentDirectory.id
          : props.currentFile?.directoryId
            ? Number(props.currentFile.directoryId)
            : 0,
      fileId: modalData.value.fileList[0].fileId,
      fileName: modalData.value.fileName,
      id: props.currentFile?.id,
      controlType: modalData.value.controlType,
      effectiveTime: modalData.value.controlType === 1 ? modalData.value.effectiveTime : "",
      expireDate: modalData.value.controlType === 2 ? modalData.value.expireDate : "",
      changeReason: modalData.value.changeReason.trim(),
      locationRelations: cloneLocationRelations(modalData.value.locationRelations),
      productRelations: normalizeProductRelations(modalData.value.productRelations)
    })
    ElMessage.success("修订成功")
  } else {
    if (!validateRelationStep()) return

    await requestCreateDocument({
      directoryId:
        props.currentDirectory?.id && props.currentDirectory.id != 0
          ? props.currentDirectory.id
          : props.currentFile?.directoryId
            ? Number(props.currentFile.directoryId)
            : 0,
      fileIds: modalData.value.fileList.map((item) => item.fileId),
      controlType: modalData.value.controlType,
      effectiveTime: modalData.value.controlType === 1 ? modalData.value.effectiveTime : "",
      expireDate: modalData.value.controlType === 2 ? modalData.value.expireDate : "",
      locationRelations: modalData.value.locationRelations,
      productRelations: modalData.value.productRelations
    })
    ElMessage.success("上传成功")
  }

  emit("onOk")
  show.value = false
}

const setShow = () => {
  show.value = true
}

const setStatus = (value: EnumType) => {
  modalStatus.value = value
  if (value === EnumType.ADD) {
    applyBaseDirectoryInfo()
  }
}

const setModalData = (value: Partial<IModalData>) => {
  modalData.value = {
    ...createDefaultModalData(),
    ...value,
    locationRelations: cloneLocationRelations(value.locationRelations || []),
    productRelations: normalizeProductRelations(value.productRelations || [])
  }
}

defineExpose({
  setShow,
  setStatus,
  setModalData
})
</script>

<style lang="scss" scoped>
.document-upload-modal {
  .upload-steps {
    margin-bottom: 20px;
  }

  .step-panel {
    min-height: 420px;
  }
}

.upload-form {
  .section-card + .section-card {
    margin-top: 16px;
  }
}

.section-card {
  padding: 18px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: linear-gradient(180deg, #fbfdff 0%, #f6f9fc 100%);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 22px;
}

.section-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
  line-height: 20px;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-field {
  width: 100%;
}

.relation-layout {
  display: grid;
  grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
  gap: 16px;
}

.relation-tabs-card {
  padding-top: 10px;
}

.relation-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 14px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: #d7e2ee;
  }

  :deep(.el-tabs__item) {
    height: 44px;
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tab-count {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #e8f3ff;
  color: #1768ac;
  font-size: 12px;
  line-height: 22px;
  text-align: center;
  box-sizing: border-box;
}

.tab-panel {
  padding-top: 2px;
}

.relation-pane {
  min-width: 0;
  padding: 16px;
  border: 1px solid #d7e2ee;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
}

.relation-pane-tree {
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.pane-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.pane-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pane-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.pane-meta {
  margin-bottom: 12px;
  font-size: 12px;
  color: #606266;
  line-height: 20px;
}

.location-tree {
  height: 360px;
  padding: 10px 12px;
  overflow: auto;
  border: 1px solid #e4ebf3;
  border-radius: 6px;
  background: #fff;
}

.relation-table {
  margin-top: 12px;
}

.process-dialog {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.process-panel {
  min-width: 0;
}

.process-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.process-search {
  margin-bottom: 12px;
}

.process-toolbar {
  margin-bottom: 8px;
}

.tips {
  margin-left: 8px;
  color: var(--g-shadow-color);
}

.full-width {
  width: 100%;
}

@media (max-width: 1400px) {
  .relation-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 960px) {
  .process-dialog {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
