<template>
  <div class="check-config">
    <CustomTitle title="点检配置">
      <div v-if="!justSee">
        <el-button type="primary" icon="Plus" @click="onCreateBlank">新增点检项</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #inspectionCode-default="{ row }">
        <el-input
          v-model.trim="row.spotItem.inspectionCode"
          :disabled="justSee"
          placeholder="请输入点检项编号"
          clearable
          class="table-input"
        />
      </template>

      <template #inspectionName-default="{ row }">
        <el-input
          v-model.trim="row.spotItem.inspectionName"
          :disabled="justSee"
          placeholder="请输入点检项名称"
          clearable
          class="table-input"
        />
      </template>

      <template #applicableScope-default="{ row }">
        <el-select
          v-model="row.spotItem.applicableScope"
          :disabled="justSee"
          class="table-select"
          @change="onApplicableScopeChange(row.spotItem, $event)"
        >
          <el-option
            v-for="item in applicableScopeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #inspectionFrequency-default="{ row }">
        <el-select
          v-model="row.spotItem.inspectionFrequency"
          :disabled="justSee"
          class="table-select"
        >
          <el-option
            v-for="item in frequencyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #intervalDays-default="{ row }">
        <el-input-number
          v-model="row.spotItem.intervalDays"
          :disabled="justSee"
          :min="1"
          :step="1"
          :precision="0"
          :controls="false"
          placeholder="天数"
          class="table-input-number"
        />
      </template>

      <template #inspectionTiming-default="{ row }">
        <el-select
          v-model="row.spotItem.inspectionTiming"
          :disabled="justSee"
          class="table-select"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择"
        >
          <el-option
            v-for="item in inspectionTimingOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #timePoints-default="{ row }">
        <div class="time-point-cell">
          <el-time-picker
            v-model="row.spotItem.timePoints[0]"
            :disabled="justSee"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="--:--"
            class="time-point-picker"
          />
          <el-button v-if="!justSee" link type="primary" size="small" @click="addTimePoint(row.spotItem)">
            +
          </el-button>
          <el-button
            v-if="!justSee && row.spotItem.timePoints.length > 1"
            link
            type="danger"
            size="small"
            @click="removeTimePoint(row.spotItem, 0)"
          >
            -
          </el-button>
        </div>
      </template>

      <template #applicableProducts-default="{ row }">
        <el-select
          :model-value="getPrimaryProductId(row.spotItem)"
          :disabled="justSee || !isProductScope(row.spotItem)"
          class="table-select"
          clearable
          placeholder="请选择产品"
          @change="onPrimaryProductChange(row.spotItem, $event)"
        >
          <el-option
            v-for="item in row.spotItem.applicableProducts"
            :key="item.id"
            :label="item.name || item.code || item.id"
            :value="item.id"
          />
        </el-select>
      </template>

      <template #standardType-default="{ row }">
        <el-select
          v-model="row.spotItem.inspectionStandard.standardType"
          :disabled="justSee"
          class="table-select"
          @change="onStandardTypeChange(row.spotItem.inspectionStandard, $event)"
        >
          <el-option
            v-for="item in standardTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #method-default="{ row }">
        <el-input
          v-model.trim="row.spotItem.method"
          :disabled="justSee"
          placeholder="请输入探测方式"
          clearable
          class="table-input"
        />
      </template>

      <template #inspectionStandard-default="{ row }">
        <div class="standard-cell">
          <el-input
            v-if="Number(row.spotItem.inspectionStandard.standardType) === InspectionStandardType.Text"
            v-model.trim="row.spotItem.inspectionStandard.standardDesc"
            :disabled="justSee"
            placeholder="请输入检验标准"
            clearable
            class="table-input standard-input-text"
          />
          <span v-else class="standard-text">{{ formatStandard(row.spotItem) || "-" }}</span>
          <el-button
            v-if="!justSee"
            link
            type="primary"
            size="small"
            class="standard-action"
            @click="onEditRow(row)"
          >
            详情配置
          </el-button>
        </div>
      </template>

      <template #files-default="{ row }">
        <div v-if="row.spotItem.files.length" class="image-list-cell">
          <el-image
            v-for="item in row.spotItem.files"
            :key="item.fileId"
            class="image-item"
            :src="item.fileUrl"
            :preview-src-list="[item.fileUrl]"
            :preview-teleported="true"
            fit="contain"
          />
        </div>
        <span v-else>-</span>
      </template>

      <template #specialFlag-default="{ row }">
        <el-checkbox v-model="row.spotItem.specialFlag" :disabled="justSee" />
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="onCopyRow(row)">复制</el-button>
        <el-button link type="danger" size="small" @click="onDeleteRow(row)">删除</el-button>
      </template>
    </CustomTable>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1080px"
      destroy-on-close
      append-to-body
      class="mro-maintenance-config-dialog"
    >
      <el-form ref="formRef" :model="dialogForm" :rules="formRules" label-width="120px">
        <div class="section-title">基础信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="点检项编号" prop="inspectionCode">
              <el-input v-model.trim="dialogForm.inspectionCode" placeholder="请输入点检项编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点检项名称" prop="inspectionName">
              <el-input v-model.trim="dialogForm.inspectionName" placeholder="请输入点检项名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准类型" prop="inspectionStandard.standardType">
              <el-select
                v-model="dialogForm.inspectionStandard.standardType"
                class="w-full"
                @change="onStandardTypeChange(dialogForm.inspectionStandard, $event)"
              >
                <el-option
                  v-for="item in standardTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="探测方式" prop="method">
              <el-input v-model.trim="dialogForm.method" placeholder="请输入探测方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">点检条件</div>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="检验标准">
              <div class="w-full">
                <template
                  v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number"
                >
                  <div class="quantitative-layout">
                    <div
                      class="quantitative-card"
                      :class="{ 'is-active': isSingleQuantitativeMode, 'is-inactive': !isSingleQuantitativeMode }"
                      @click="activateSingleMode"
                    >
                      <div class="quantitative-card__head">
                        <span class="mode-indicator" :class="{ 'is-active': isSingleQuantitativeMode }"></span>
                        <span class="quantitative-card__title">单区间</span>
                        <span v-if="isSingleQuantitativeMode" class="active-tag">当前生效</span>
                      </div>
                      <div class="single-mode-row">
                        <el-select
                          v-model="singleIntervalOperator"
                          class="operator-select"
                          :disabled="!isSingleQuantitativeMode"
                          @focus="activateSingleMode"
                        >
                          <el-option label=">" value=">" />
                          <el-option label=">=" value=">=" />
                          <el-option label="<" value="<" />
                          <el-option label="<=" value="<=" />
                        </el-select>
                        <el-input-number
                          v-model="singleIntervalValue"
                          class="standard-input"
                          :controls="false"
                          :disabled="!isSingleQuantitativeMode"
                          placeholder="请输入标准值"
                          @focus="activateSingleMode"
                        />
                      </div>
                    </div>

                    <div
                      class="quantitative-card"
                      :class="{ 'is-active': !isSingleQuantitativeMode, 'is-inactive': isSingleQuantitativeMode }"
                      @click="activateRangeMode"
                    >
                      <div class="quantitative-card__head">
                        <span class="mode-indicator" :class="{ 'is-active': !isSingleQuantitativeMode }"></span>
                        <span class="quantitative-card__title">双区间</span>
                        <span v-if="!isSingleQuantitativeMode" class="active-tag">当前生效</span>
                      </div>
                      <div class="standard-range-layout">
                        <div class="standard-value-card">
                          <span class="range-label">标准值</span>
                          <el-input-number
                            v-model="dialogForm.inspectionStandard.standardValue"
                            :controls="false"
                            class="range-number"
                            :disabled="isSingleQuantitativeMode"
                            placeholder="请输入标准值"
                            @focus="activateRangeMode"
                          />
                        </div>
                        <div class="tolerance-stack">
                          <div class="tolerance-row">
                            <span class="tolerance-row-label">上公差</span>
                            <el-select
                              v-model="dialogForm.inspectionStandard.upperToleranceSign"
                              class="tolerance-sign-select"
                              :disabled="isSingleQuantitativeMode"
                              @focus="activateRangeMode"
                            >
                              <el-option label="+" value="+" />
                              <el-option label="-" value="-" />
                            </el-select>
                            <el-input-number
                              v-model="dialogForm.inspectionStandard.upperTolerance"
                              :controls="false"
                              class="range-number"
                              :disabled="isSingleQuantitativeMode"
                              placeholder="请输入上公差"
                              @focus="activateRangeMode"
                            />
                          </div>
                          <div class="tolerance-row">
                            <span class="tolerance-row-label">下公差</span>
                            <el-select
                              v-model="dialogForm.inspectionStandard.lowerToleranceSign"
                              class="tolerance-sign-select"
                              :disabled="isSingleQuantitativeMode"
                              @focus="activateRangeMode"
                            >
                              <el-option label="+" value="+" />
                              <el-option label="-" value="-" />
                            </el-select>
                            <el-input-number
                              v-model="dialogForm.inspectionStandard.lowerTolerance"
                              :controls="false"
                              class="range-number"
                              :disabled="isSingleQuantitativeMode"
                              placeholder="请输入下公差"
                              @focus="activateRangeMode"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <el-input
                  v-else
                  v-model.trim="dialogForm.inspectionStandard.standardDesc"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入检验标准"
                />
              </div>
            </el-form-item>
          </el-col>

          <el-col v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number" :span="12">
            <el-form-item label="检验标准预览">
              <div class="standard-preview">{{ standardPreview }}</div>
            </el-form-item>
          </el-col>
          <el-col v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number" :span="12">
            <el-form-item label="单位">
              <el-select
                v-model="dialogForm.inspectionStandard.unitId"
                class="w-full"
                clearable
                filterable
                placeholder="请选择单位"
              >
                <el-option
                  v-for="item in unitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="isProductScope(dialogForm)" :span="24">
            <div class="scope-product-grid">
              <div class="scope-product-grid__left">
                <el-form-item label="适用范围" prop="applicableScope">
                  <el-select
                    v-model="dialogForm.applicableScope"
                    class="w-full"
                    @change="onApplicableScopeChange(dialogForm, $event)"
                  >
                    <el-option
                      v-for="item in applicableScopeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="点检频率" prop="inspectionFrequency">
                  <el-select v-model="dialogForm.inspectionFrequency" class="w-full">
                    <el-option
                      v-for="item in frequencyOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <el-form-item label="适配产品" prop="productIds" class="scope-product-grid__right">
                <div class="product-field">
                  <div class="product-selector-card">
                    <div class="product-selector-card__summary">
                      <div class="product-selector-card__text">
                        <div class="product-selector-card__count">{{ selectedProductSummary }}</div>
                        <div class="product-selector-card__hint">点击右侧按钮维护适用产品</div>
                      </div>
                      <div class="product-selector-card__actions">
                        <el-button
                          type="primary"
                          plain
                          size="small"
                          class="product-selector-card__select-btn"
                          @click="productDialogVisible = true"
                        >
                          选择
                        </el-button>
                        <el-button
                          link
                          size="small"
                          class="product-selector-card__clear-btn"
                          :disabled="!dialogForm.productIds.length"
                          @click="clearSelectedProducts"
                        >
                          清空
                        </el-button>
                      </div>
                    </div>
                    <div class="product-selector-card__tags">
                      <template v-if="selectedProductPreviewList.length">
                        <el-tag
                          v-for="item in selectedProductPreviewList"
                          :key="item.id"
                          class="product-tag"
                          disable-transitions
                        >
                          {{ item.name }}
                        </el-tag>
                        <el-tag
                          v-if="selectedProductExtraCount"
                          class="product-tag product-tag--more"
                          disable-transitions
                        >
                          +{{ selectedProductExtraCount }}
                        </el-tag>
                      </template>
                      <span v-else class="empty-text">未选择产品</span>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </div>
          </el-col>
          <template v-else>
            <el-col :span="12">
              <el-form-item label="适用范围" prop="applicableScope">
                <el-select
                  v-model="dialogForm.applicableScope"
                  class="w-full"
                  @change="onApplicableScopeChange(dialogForm, $event)"
                >
                  <el-option
                    v-for="item in applicableScopeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="点检频率" prop="inspectionFrequency">
                <el-select v-model="dialogForm.inspectionFrequency" class="w-full">
                  <el-option
                    v-for="item in frequencyOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </template>
        </el-row>

        <div class="section-title">辅助信息</div>
        <el-form-item label="图片说明">
          <UploadImage v-model="dialogForm.files" :limit="5" multiple />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onDialogSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-if="false"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1080px"
      destroy-on-close
      append-to-body
      class="check-config-dialog"
    >
      <el-form ref="formRef" :model="dialogForm" :rules="formRules" label-width="120px">
        <div class="section-title">基础信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="点检项编号" prop="inspectionCode">
              <el-input v-model.trim="dialogForm.inspectionCode" placeholder="请输入点检项编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点检项名称" prop="inspectionName">
              <el-input v-model.trim="dialogForm.inspectionName" placeholder="请输入点检项名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点检频率" prop="inspectionFrequency">
              <el-select v-model="dialogForm.inspectionFrequency" class="w-full">
                <el-option
                  v-for="item in frequencyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用范围" prop="applicableScope">
              <el-select
                v-model="dialogForm.applicableScope"
                class="w-full"
                @change="onApplicableScopeChange(dialogForm, $event)"
              >
                <el-option
                  v-for="item in applicableScopeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="isProductScope(dialogForm)" :span="12">
            <el-form-item label="适配产品" prop="productIds">
              <div class="product-select-block">
                <el-button type="primary" plain @click="productDialogVisible = true">
                  选择适用产品
                </el-button>
                <div v-if="dialogForm.applicableProducts.length" class="product-tag-list">
                  <el-tag
                    v-for="item in dialogForm.applicableProducts"
                    :key="item.id"
                    class="product-tag"
                    disable-transitions
                  >
                    {{ item.name }}
                  </el-tag>
                </div>
                <span v-else class="empty-text">未选择产品</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">点检条件</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="探测方式" prop="method">
              <el-input v-model.trim="dialogForm.method" placeholder="请输入探测方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准类型" prop="inspectionStandard.standardType">
              <el-select
                v-model="dialogForm.inspectionStandard.standardType"
                class="w-full"
                @change="onStandardTypeChange(dialogForm.inspectionStandard, $event)"
              >
                <el-option
                  v-for="item in standardTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="检验标准" prop="inspectionStandard.standardDesc">
              <div class="w-full">
                <template
                  v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number"
                >
                  <div class="standard-config-block">
                    <div class="standard-range-layout">
                      <div class="standard-value-card">
                        <span class="range-label">标准下限</span>
                        <div class="limit-row">
                          <el-select
                            v-model="dialogForm.inspectionStandard.standardMinInclusive"
                            class="limit-operator"
                          >
                            <el-option label="<=" :value="1" />
                            <el-option label="<" :value="0" />
                          </el-select>
                          <el-input
                            v-model="dialogForm.inspectionStandard.standardMin"
                            placeholder="请输入标准下限"
                            class="limit-input"
                          />
                        </div>
                      </div>
                      <div class="standard-value-card">
                        <span class="range-label">标准上限</span>
                        <div class="limit-row">
                          <el-select
                            v-model="dialogForm.inspectionStandard.standardMaxInclusive"
                            class="limit-operator"
                          >
                            <el-option label="<=" :value="1" />
                            <el-option label="<" :value="0" />
                          </el-select>
                          <el-input
                            v-model="dialogForm.inspectionStandard.standardMax"
                            placeholder="请输入标准上限"
                            class="limit-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <el-input
                  v-else
                  v-model.trim="dialogForm.inspectionStandard.standardDesc"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入检验标准"
                />
              </div>
            </el-form-item>
          </el-col>

          <template
            v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number"
          >
            <el-col :span="12">
              <el-form-item label="检验标准预览">
                <div class="standard-preview">{{ formatStandard(dialogForm) || "-" }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单位">
                <el-select
                  v-model="dialogForm.inspectionStandard.unitId"
                  class="w-full"
                  clearable
                  filterable
                  placeholder="请选择单位"
                >
                  <el-option
                    v-for="item in unitOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </template>
        </el-row>

        <div class="section-title">辅助信息</div>
        <el-form-item label="图片说明">
          <UploadImage v-model="dialogForm.files" :limit="5" multiple />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onDialogSave">保存</el-button>
      </template>
    </el-dialog>

    <SelectProductDialog
      v-model="productDialogVisible"
      :selected-row-keys="dialogForm.productIds"
      multiple
      @success="onSelectProductSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"
import cloneDeep from "lodash/cloneDeep"

import {
  editEquipmentModelConfig,
  getEquipmentModelConfigPaged
} from "@/api/equipmentModelConfig"
import { DeviceInitSettingTabs, InspectionStandardType } from "@/api/operation/equipment/types"
import { type IProductModelListItem, queryProductModelListByIdList } from "@/api/product"
import { getUnit } from "@/api/units"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import type { IOption, IUploadPhoto } from "@/types/base-info/global-config"
import { isNumberStandardValid } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

interface IProductSummary {
  id: string
  code: string
  name: string
}

type IQuantitativeMode = "lower" | "upper" | "range"

interface IInspectionStandard {
  standardDesc: string
  standardMax: string | number | null
  standardMaxInclusive: number
  standardMin: string | number | null
  standardMinInclusive: number
  standardType: number
  quantitativeMode?: IQuantitativeMode
  standardValue?: number | string | null
  upperTolerance?: number | string | null
  lowerTolerance?: number | string | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
  unitId: string
  unitName: string
}

interface ISpotItem {
  inspectionName: string
  inspectionCode: string
  inspectionFrequency: number
  intervalDays: number | null
  inspectionTiming: string[]
  timePoints: string[]
  applicableScope: number
  productIds: string[]
  applicableProducts: IProductSummary[]
  method: string
  inspectionStandard: IInspectionStandard
  files: IUploadPhoto[]
  fileDesc: string
  remarks: string
  specialFlag: boolean
}

interface ITableRow {
  id: string
  equipmentModelId: string
  mconfigType: number
  isTemp?: boolean
  spotItem: ISpotItem
}

const props = defineProps<{
  modelId: string
  justSee?: boolean
}>()

const emit = defineEmits<{
  (e: "success"): void
  (e: "dirty-change", value: boolean): void
}>()

const DAILY_FREQUENCY = 1
const SHIFT_FREQUENCY = 2
const APPLICABLE_SCOPE_GENERAL = 1
const APPLICABLE_SCOPE_PRODUCT = 2
const DEFAULT_INSPECTION_TIMING = "beforeShift"

const frequencyOptions = [
  { label: "按天", value: DAILY_FREQUENCY },
  { label: "按班", value: SHIFT_FREQUENCY }
]
const inspectionTimingOptions = [
  { label: "班前", value: "beforeShift" },
  { label: "班中", value: "duringShift" },
  { label: "班后", value: "afterShift" }
]
const applicableScopeOptions = [
  { label: "通用", value: APPLICABLE_SCOPE_GENERAL },
  { label: "产品", value: APPLICABLE_SCOPE_PRODUCT }
]
const standardTypeOptions = [
  { label: "定量", value: InspectionStandardType.Number },
  { label: "定性", value: InspectionStandardType.Text }
]

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const formRef = ref<FormInstance>()
const tableData = ref<ITableRow[]>([])
const dialogVisible = ref(false)
const productDialogVisible = ref(false)
const editingRowId = ref("")
const dialogForm = ref<ISpotItem>(createDefaultSpotItem())
const unitOptions = ref<IOption[]>([])
const loaded = ref(false)
const savedPayloadText = ref("[]")

const currentUnitName = computed(
  () =>
    unitOptions.value.find((item) => String(item.value) === String(dialogForm.value.inspectionStandard.unitId))
      ?.label || dialogForm.value.inspectionStandard.unitName || ""
)

const isSingleQuantitativeMode = computed(
  () => dialogForm.value.inspectionStandard.quantitativeMode !== "range"
)

function clearSingleQuantitativeFields(standard: IInspectionStandard) {
  standard.standardMax = null
  standard.standardMaxInclusive = 1
  standard.standardMin = null
  standard.standardMinInclusive = 1
}

function clearRangeQuantitativeFields(standard: IInspectionStandard) {
  standard.standardValue = null
  standard.upperTolerance = null
  standard.lowerTolerance = null
  standard.upperToleranceSign = "+"
  standard.lowerToleranceSign = "-"
}

function applySingleIntervalMode(standard: IInspectionStandard, mode: "lower" | "upper", inclusive: number) {
  clearRangeQuantitativeFields(standard)
  standard.quantitativeMode = mode
  if (mode === "upper") {
    standard.standardMin = null
    standard.standardMinInclusive = 1
    standard.standardMaxInclusive = inclusive
    return
  }
  standard.standardMax = null
  standard.standardMaxInclusive = 1
  standard.standardMinInclusive = inclusive
}

const singleIntervalOperator = computed({
  get: () => {
    const standard = dialogForm.value.inspectionStandard
    if (standard.quantitativeMode === "upper") {
      return Number(standard.standardMaxInclusive ?? 1) === 1 ? "<=" : "<"
    }
    return Number(standard.standardMinInclusive ?? 1) === 1 ? ">=" : ">"
  },
  set: (value: string) => {
    const standard = dialogForm.value.inspectionStandard
    if (value === "<" || value === "<=") {
      applySingleIntervalMode(standard, "upper", value === "<=" ? 1 : 0)
      return
    }
    applySingleIntervalMode(standard, "lower", value === ">=" ? 1 : 0)
  }
})

const singleIntervalValue = computed<number | undefined>({
  get: () => {
    const standard = dialogForm.value.inspectionStandard
    const value =
      standard.quantitativeMode === "upper" ? standard.standardMax : standard.standardMin
    return hasStandardNumericValue(value) ? Number(value) : undefined
  },
  set: (value) => {
    const standard = dialogForm.value.inspectionStandard
    if (standard.quantitativeMode === "upper") {
      standard.standardMax = value ?? null
      return
    }
    standard.standardMin = value ?? null
  }
})

const standardPreview = computed(() => {
  const standard = dialogForm.value.inspectionStandard
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim()
  }
  return (
    typeNumberHandle(
      {
        standardType: 1,
        standardDesc: "",
        standardMax: standard.quantitativeMode === "upper" ? standard.standardMax ?? null : null,
        standardMaxInclusive: standard.standardMaxInclusive,
        standardMin: standard.quantitativeMode === "lower" ? standard.standardMin ?? null : null,
        standardMinInclusive: standard.standardMinInclusive,
        quantitativeMode: standard.quantitativeMode,
        standardValue: standard.quantitativeMode === "range" ? standard.standardValue ?? null : null,
        upperTolerance: standard.quantitativeMode === "range" ? standard.upperTolerance ?? null : null,
        lowerTolerance: standard.quantitativeMode === "range" ? standard.lowerTolerance ?? null : null,
        upperToleranceSign: standard.upperToleranceSign,
        lowerToleranceSign: standard.lowerToleranceSign,
        unitName: currentUnitName.value
      },
      true
    ) || ""
  )
})

const dialogTitle = computed(() => {
  const row = tableData.value.find((item) => item.id === editingRowId.value)
  return row?.isTemp ? "新增点检项" : "编辑点检项"
})

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data ?? null))
}

const selectedProductPreviewList = computed(() => dialogForm.value.applicableProducts.slice(0, 4))

const selectedProductExtraCount = computed(() =>
  Math.max(dialogForm.value.applicableProducts.length - selectedProductPreviewList.value.length, 0)
)

const selectedProductSummary = computed(() => {
  const count = dialogForm.value.productIds.length
  return count ? `已选 ${count} 个产品` : "未选择产品"
})

const formRules = reactive<FormRules<ISpotItem>>({
  inspectionName: [{ required: true, message: "请输入点检项名称", trigger: "blur" }],
  inspectionFrequency: [{ required: true, message: "请选择点检频率", trigger: "change" }],
  applicableScope: [{ required: true, message: "请选择适用范围", trigger: "change" }],
  productIds: [
    {
      validator: (rule, value, callback) => {
        if (
          Number(dialogForm.value.applicableScope) === APPLICABLE_SCOPE_PRODUCT &&
          !(value || []).length
        ) {
          callback(new Error("请选择适配产品"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  "inspectionStandard.standardDesc": [
    {
      validator: (rule, value, callback) => {
        if (Number(dialogForm.value.inspectionStandard.standardType) === InspectionStandardType.Text) {
          if (!String(value || "").trim()) {
            callback(new Error("请输入检验标准"))
            return
          }
        }
        callback()
      },
      trigger: "blur"
    }
  ]
})

const tableConfig = computed<ITableConfig>(() => ({
  height: "100%",
  columns: [
    {
      prop: "inspectionCode",
      label: "点检项编号",
      minWidth: 160,
      slots: {
        default: "inspectionCode-default"
      }
    },
    {
      prop: "inspectionName",
      label: "点检项名称",
      minWidth: 180,
      slots: {
        default: "inspectionName-default"
      }
    },
    {
      prop: "applicableScope",
      label: "适用范围",
      width: 120,
      align: "center",
      slots: {
        default: "applicableScope-default"
      }
    },
    {
      prop: "inspectionFrequency",
      label: "点检频率",
      width: 120,
      align: "center",
      slots: {
        default: "inspectionFrequency-default"
      }
    },
    {
      prop: "intervalDays",
      label: "间隔天数",
      width: 110,
      align: "center",
      slots: {
        default: "intervalDays-default"
      }
    },
    {
      prop: "inspectionTiming",
      label: "点检时机",
      width: 180,
      align: "center",
      slots: {
        default: "inspectionTiming-default"
      }
    },
    {
      prop: "timePoints",
      label: "时间点",
      width: 150,
      align: "center",
      slots: {
        default: "timePoints-default"
      }
    },
    {
      prop: "applicableProducts",
      label: "适配产品",
      minWidth: 150,
      showOverflowTooltip: false,
      slots: {
        default: "applicableProducts-default"
      }
    },
    {
      prop: "standardType",
      label: "标准类型",
      width: 120,
      align: "center",
      slots: {
        default: "standardType-default"
      }
    },
    {
      prop: "method",
      label: "探测方式",
      minWidth: 150,
      slots: {
        default: "method-default"
      }
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      minWidth: 180,
      showOverflowTooltip: false,
      slots: {
        default: "inspectionStandard-default"
      }
    },
    {
      prop: "specialFlag",
      label: "特殊",
      width: 90,
      align: "center",
      slots: {
        default: "specialFlag-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      hidden: !!props.justSee,
      slots: {
        default: "operation-default"
      }
    }
  ]
}))

function createDefaultStandard(
  standardType: number = InspectionStandardType.Text
): IInspectionStandard {
  return {
    standardDesc: "",
    standardMax: null,
    standardMaxInclusive: 1,
    standardMin: null,
    standardMinInclusive: 1,
    standardType,
    quantitativeMode: "lower",
    standardValue: null,
    upperTolerance: null,
    lowerTolerance: null,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: "",
    unitName: ""
  }
}

function createDefaultSpotItem(): ISpotItem {
  return {
    inspectionName: "",
    inspectionCode: "",
    inspectionFrequency: DAILY_FREQUENCY,
    intervalDays: null,
    inspectionTiming: [DEFAULT_INSPECTION_TIMING],
    timePoints: [""],
    applicableScope: APPLICABLE_SCOPE_GENERAL,
    productIds: [],
    applicableProducts: [],
    method: "",
    inspectionStandard: createDefaultStandard(),
    files: [],
    fileDesc: "",
    remarks: "",
    specialFlag: false
  }
}

function buildTempId() {
  return `temp-spot-check-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function normalizeProductSummary(item: Record<string, any>): IProductSummary {
  return {
    id: String(item?.id || ""),
    code: String(item?.code || ""),
    name: String(item?.name || item?.productModelName || item?.label || "")
  }
}

function normalizeFile(item: Record<string, any>): IUploadPhoto {
  return {
    fileId: String(item?.id || item?.fileId || ""),
    fileName: item?.fileName || "",
    fileUrl: item?.fileUrl || formatImgUrlPreview(item?.path || "")
  }
}

function hasStandardNumericValue(value: unknown) {
  return value !== null && value !== undefined && value !== ""
}

function normalizeInspectionStandard(rawStandard: Record<string, any> = {}): IInspectionStandard {
  const hasRangeMode =
    rawStandard.quantitativeMode === "range" ||
    (hasStandardNumericValue(rawStandard.standardValue) &&
      hasStandardNumericValue(rawStandard.upperTolerance) &&
      hasStandardNumericValue(rawStandard.lowerTolerance))

  let quantitativeMode: IQuantitativeMode = "lower"
  if (hasRangeMode) {
    quantitativeMode = "range"
  } else if (hasStandardNumericValue(rawStandard.standardMax)) {
    quantitativeMode = "upper"
  }

  let standardValue = hasStandardNumericValue(rawStandard.standardValue)
    ? Number(rawStandard.standardValue)
    : null
  let upperTolerance = hasStandardNumericValue(rawStandard.upperTolerance)
    ? Number(rawStandard.upperTolerance)
    : null
  let lowerTolerance = hasStandardNumericValue(rawStandard.lowerTolerance)
    ? Number(rawStandard.lowerTolerance)
    : null
  let upperToleranceSign = (rawStandard.upperToleranceSign || "+") as "+" | "-"
  let lowerToleranceSign = (rawStandard.lowerToleranceSign || "-") as "+" | "-"

  if (
    quantitativeMode === "range" &&
    !hasStandardNumericValue(rawStandard.standardValue) &&
    hasStandardNumericValue(rawStandard.standardMin) &&
    hasStandardNumericValue(rawStandard.standardMax)
  ) {
    const min = Number(rawStandard.standardMin)
    const max = Number(rawStandard.standardMax)
    standardValue = Number(((min + max) / 2).toFixed(6))
    upperTolerance = Number((max - standardValue).toFixed(6))
    lowerTolerance = Number((min - standardValue).toFixed(6))
    upperToleranceSign = upperTolerance >= 0 ? "+" : "-"
    lowerToleranceSign = lowerTolerance >= 0 ? "+" : "-"
    upperTolerance = Math.abs(upperTolerance)
    lowerTolerance = Math.abs(lowerTolerance)
  }

  return {
    standardDesc: String(rawStandard.standardDesc || ""),
    standardMax: hasStandardNumericValue(rawStandard.standardMax) ? Number(rawStandard.standardMax) : null,
    standardMaxInclusive: Number(rawStandard.standardMaxInclusive ?? 1),
    standardMin: hasStandardNumericValue(rawStandard.standardMin) ? Number(rawStandard.standardMin) : null,
    standardMinInclusive: Number(rawStandard.standardMinInclusive ?? 1),
    standardType: Number(rawStandard.standardType || InspectionStandardType.Text),
    quantitativeMode,
    standardValue,
    upperTolerance,
    lowerTolerance,
    upperToleranceSign,
    lowerToleranceSign,
    unitId: String(rawStandard.unitId || ""),
    unitName: String(rawStandard.unitName || "")
  }
}

function normalizeInspectionFrequency(value: unknown) {
  const nextValue = Number(value || DAILY_FREQUENCY)
  return frequencyOptions.some((item) => item.value === nextValue) ? nextValue : DAILY_FREQUENCY
}

function normalizeInspectionTiming(value: unknown) {
  const values = (Array.isArray(value) ? value : [value])
    .map((item) => String(item || ""))
    .filter((item) => inspectionTimingOptions.some((option) => option.value === item))
  return values.length ? values : [DEFAULT_INSPECTION_TIMING]
}

function normalizeSpotItem(rawItem: Record<string, any> = {}): ISpotItem {
  const applicableProducts = Array.isArray(rawItem?.applicableProducts)
    ? rawItem.applicableProducts.map((item: Record<string, any>) => normalizeProductSummary(item))
    : []
  const productIds =
    rawItem?.productIds?.map?.((item: string | number) => String(item)) ||
    applicableProducts.map((item) => item.id)

  return {
    inspectionName: String(rawItem?.inspectionName || "").trim(),
    inspectionCode: String(rawItem?.inspectionCode || "").trim(),
    inspectionFrequency: normalizeInspectionFrequency(rawItem?.inspectionFrequency),
    intervalDays:
      rawItem?.intervalDays === null || rawItem?.intervalDays === undefined || rawItem?.intervalDays === ""
        ? null
        : Number(rawItem.intervalDays),
    inspectionTiming: normalizeInspectionTiming(rawItem?.inspectionTiming),
    timePoints: Array.isArray(rawItem?.timePoints)
      ? rawItem.timePoints.map((item: string | number) => String(item || ""))
      : [String(rawItem?.timePoint || "")],
    applicableScope: Number(
      rawItem?.applicableScope || (productIds.length ? APPLICABLE_SCOPE_PRODUCT : APPLICABLE_SCOPE_GENERAL)
    ),
    productIds,
    applicableProducts,
    method: String(rawItem?.method || "").trim(),
    inspectionStandard: normalizeInspectionStandard(rawItem?.inspectionStandard || {}),
    files: Array.isArray(rawItem?.files) ? rawItem.files.map(normalizeFile) : [],
    fileDesc: String(rawItem?.fileDesc || ""),
    remarks: String(rawItem?.remarks || ""),
    specialFlag: Boolean(rawItem?.specialFlag ?? rawItem?.special)
  }
}

function parseConfigValue(value: unknown) {
  if (!value || typeof value !== "string") return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function normalizeRow(row: Record<string, any>): ITableRow {
  const parsedMconfigValue = parseConfigValue(row?.mconfigValue) as Record<string, any>
  const parsedSpotConfigValue = parseConfigValue(row?.spotConfigValue) as Record<string, any>
  const rawSpotItem =
    row?.spotItem ||
    parsedSpotConfigValue ||
    parseConfigValue(parsedMconfigValue?.spotConfigValue) ||
    {}
  return {
    id: row?.id ? String(row.id) : buildTempId(),
    equipmentModelId: String(row?.equipmentModelId || props.modelId || ""),
    mconfigType: Number(row?.mconfigType || DeviceInitSettingTabs.check),
    isTemp: !row?.id,
    spotItem: normalizeSpotItem(rawSpotItem)
  }
}

function isProductScope(item: Pick<ISpotItem, "applicableScope">) {
  return Number(item.applicableScope) === APPLICABLE_SCOPE_PRODUCT
}

function formatProductSummary(item: ISpotItem) {
  if (!isProductScope(item)) return "-"
  if (!item.applicableProducts.length) return `${item.productIds.length || 0}个产品`
  if (item.applicableProducts.length <= 2) {
    return item.applicableProducts.map((product) => product.name || product.code || product.id).join("、")
  }
  const names = item.applicableProducts
    .slice(0, 2)
    .map((product) => product.name || product.code || product.id)
  return `${names.join("、")} +${item.applicableProducts.length - 2}`
}

function getPrimaryProductId(item: ISpotItem) {
  return item.productIds[0] || item.applicableProducts[0]?.id || ""
}

function onPrimaryProductChange(item: ISpotItem, value?: string | number) {
  const productId = String(value || "")
  if (!productId) {
    item.productIds = []
    item.applicableProducts = []
    return
  }

  const selectedProduct = item.applicableProducts.find((product) => String(product.id) === productId)
  item.productIds = [productId]
  item.applicableProducts = selectedProduct
    ? [selectedProduct]
    : [{ id: productId, code: "", name: productId }]
}

function formatStandard(item: Pick<ISpotItem, "inspectionStandard">) {
  const standard = item.inspectionStandard
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim()
  }
  return typeNumberHandle(standard, true)
}

function onApplicableScopeChange(item: ISpotItem, value: number) {
  item.applicableScope = Number(value || APPLICABLE_SCOPE_GENERAL)
  if (!isProductScope(item)) {
    item.productIds = []
    item.applicableProducts = []
  }
}

function onStandardTypeChange(standard: IInspectionStandard, value: number) {
  const nextValue = Number(value || InspectionStandardType.Text)
  standard.standardType = nextValue
  if (nextValue === InspectionStandardType.Text) {
    standard.quantitativeMode = "lower"
    standard.standardMax = null
    standard.standardMaxInclusive = 1
    standard.standardMin = null
    standard.standardMinInclusive = 1
    standard.standardValue = null
    standard.upperTolerance = null
    standard.lowerTolerance = null
    standard.upperToleranceSign = "+"
    standard.lowerToleranceSign = "-"
    standard.unitId = ""
    standard.unitName = ""
    return
  }
  standard.standardDesc = ""
}

function activateSingleMode() {
  const standard = dialogForm.value.inspectionStandard
  const nextMode = standard.quantitativeMode === "upper" ? "upper" : "lower"
  const inclusive =
    nextMode === "upper"
      ? Number(standard.standardMaxInclusive ?? 1)
      : Number(standard.standardMinInclusive ?? 1)
  applySingleIntervalMode(standard, nextMode, inclusive)
}

function activateRangeMode() {
  const standard = dialogForm.value.inspectionStandard
  clearSingleQuantitativeFields(standard)
  standard.quantitativeMode = "range"
}

async function loadUnitOptions() {
  if (unitOptions.value.length) return
  const data = await getUnit()
  unitOptions.value = data.map((item) => ({
    label: item.unitName,
    value: String(item.id)
  }))
}

async function fillMissingProducts(rows: ITableRow[]) {
  const missingIds = Array.from(
    new Set(
      rows.flatMap((row) => {
        if (!isProductScope(row.spotItem)) return []
        if (row.spotItem.applicableProducts.length) return []
        return row.spotItem.productIds
      })
    )
  )

  if (!missingIds.length) return

  const productList = await queryProductModelListByIdList({ idList: missingIds })
  const productMap = new Map(
    (productList || []).map((item: IProductModelListItem) => [String(item.id), normalizeProductSummary(item)])
  )

  rows.forEach((row) => {
    if (!isProductScope(row.spotItem) || row.spotItem.applicableProducts.length) return
    row.spotItem.applicableProducts = row.spotItem.productIds
      .map((id) => productMap.get(String(id)))
      .filter(Boolean) as IProductSummary[]
  })
}

function getTableSavePayload(rows: ITableRow[] = tableData.value) {
  return rows.map((row) => mapRowToSaveParams(row))
}

function syncSavedSnapshot(rows: ITableRow[] = tableData.value) {
  savedPayloadText.value = JSON.stringify(getTableSavePayload(rows))
  loaded.value = true
  emit("dirty-change", false)
}

const isDirty = computed(() => {
  if (!loaded.value) return false
  return JSON.stringify(getTableSavePayload()) !== savedPayloadText.value
})

async function getTableData(syncSnapshot = true) {
  if (!props.modelId) {
    tableData.value = []
    if (syncSnapshot) {
      syncSavedSnapshot([])
    }
    return []
  }

  customTableRef.value?.setLoading(true)
  try {
    const { records } = await getEquipmentModelConfigPaged({
      pageQuery: {
        pageNum: 1,
        pageSize: 1000
      },
      queryParam: {
        equipmentModelId: props.modelId,
        mconfigType: DeviceInitSettingTabs.check
      }
    })

    const rows = (records || []).map((item) => normalizeRow(item))
    await fillMissingProducts(rows)
    tableData.value = rows
    if (syncSnapshot) {
      syncSavedSnapshot(rows)
    }
    return rows
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

function onCreateBlank() {
  const row = {
    id: buildTempId(),
    equipmentModelId: props.modelId,
    mconfigType: DeviceInitSettingTabs.check,
    isTemp: true,
    spotItem: createDefaultSpotItem()
  }
  tableData.value = [row, ...tableData.value]
  void nextTick(() => customTableRef.value?.setHighLightRow(row.id))
}

function createCopiedRow(row: ITableRow): ITableRow {
  return {
    ...cloneDeep(row),
    id: buildTempId(),
    isTemp: true,
    spotItem: {
      ...cloneDeep(row.spotItem),
      inspectionCode: ""
    }
  }
}

function onCopyRow(row: ITableRow) {
  const nextRow = createCopiedRow(row)
  tableData.value = [nextRow, ...tableData.value]
  void nextTick(() => customTableRef.value?.setHighLightRow(nextRow.id))
}

async function onEditRow(row: ITableRow) {
  editingRowId.value = row.id
  dialogForm.value = cloneDeep(row.spotItem)
  await loadUnitOptions()
  dialogVisible.value = true
}

function normalizeProductPayload(item: ISpotItem) {
  if (!isProductScope(item)) {
    item.productIds = []
    item.applicableProducts = []
    return
  }

  const productMap = new Map(item.applicableProducts.map((product) => [product.id, product]))
  item.applicableProducts = item.productIds
    .map((id) => productMap.get(String(id)))
    .filter(Boolean) as IProductSummary[]
}

async function clearSelectedProducts() {
  dialogForm.value.productIds = []
  dialogForm.value.applicableProducts = []
  await nextTick()
  formRef.value?.validateField("productIds").catch(() => false)
}

function validateQuantitativeFields(standard: IInspectionStandard) {
  if (standard.quantitativeMode === "lower" && !hasStandardNumericValue(standard.standardMin)) {
    return "请输入下限值"
  }
  if (standard.quantitativeMode === "upper" && !hasStandardNumericValue(standard.standardMax)) {
    return "请输入上限值"
  }
  if (standard.quantitativeMode === "range") {
    if (!hasStandardNumericValue(standard.standardValue)) return "请输入标准值"
    if (!hasStandardNumericValue(standard.upperTolerance)) return "请输入上公差"
    if (!hasStandardNumericValue(standard.lowerTolerance)) return "请输入下公差"
  }
  return ""
}

function buildInspectionStandardPayload(standard: IInspectionStandard, previewText?: string) {
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return {
      standardType: InspectionStandardType.Text,
      standardDesc: String(standard.standardDesc || "").trim()
    }
  }

  const mode = standard.quantitativeMode || "lower"
  const upperDeviation =
    mode === "range"
      ? (standard.upperToleranceSign === "-" ? -1 : 1) * Number(standard.upperTolerance || 0)
      : 0
  const lowerDeviation =
    mode === "range"
      ? (standard.lowerToleranceSign === "-" ? -1 : 1) * Number(standard.lowerTolerance || 0)
      : 0

  return {
    standardType: InspectionStandardType.Number,
    standardDesc: previewText ?? standardPreview.value,
    standardMax:
      mode === "upper"
        ? Number(standard.standardMax)
        : mode === "range"
          ? Number(standard.standardValue) + Math.max(upperDeviation, lowerDeviation)
          : null,
    standardMaxInclusive: mode === "upper" ? Number(standard.standardMaxInclusive ?? 1) : 1,
    standardMin:
      mode === "lower"
        ? Number(standard.standardMin)
        : mode === "range"
          ? Number(standard.standardValue) + Math.min(upperDeviation, lowerDeviation)
          : null,
    standardMinInclusive: mode === "lower" ? Number(standard.standardMinInclusive ?? 1) : 1,
    quantitativeMode: mode,
    standardValue: mode === "range" ? Number(standard.standardValue) : null,
    upperTolerance: mode === "range" ? Number(standard.upperTolerance) : null,
    lowerTolerance: mode === "range" ? Number(standard.lowerTolerance) : null,
    upperToleranceSign: mode === "range" ? standard.upperToleranceSign || "+" : "+",
    lowerToleranceSign: mode === "range" ? standard.lowerToleranceSign || "-" : "-",
    unitId: String(standard.unitId || ""),
    unitName: String(standard.unitName || currentUnitName.value || "")
  }
}

function getInspectionStandardPreview(standard: IInspectionStandard) {
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim()
  }

  return (
    typeNumberHandle(
      {
        standardType: InspectionStandardType.Number,
        standardDesc: "",
        standardMax: standard.quantitativeMode === "upper" ? standard.standardMax ?? null : null,
        standardMaxInclusive: standard.standardMaxInclusive,
        standardMin: standard.quantitativeMode === "lower" ? standard.standardMin ?? null : null,
        standardMinInclusive: standard.standardMinInclusive,
        quantitativeMode: standard.quantitativeMode,
        standardValue: standard.quantitativeMode === "range" ? standard.standardValue ?? null : null,
        upperTolerance: standard.quantitativeMode === "range" ? standard.upperTolerance ?? null : null,
        lowerTolerance: standard.quantitativeMode === "range" ? standard.lowerTolerance ?? null : null,
        upperToleranceSign: standard.upperToleranceSign,
        lowerToleranceSign: standard.lowerToleranceSign,
        unitName: standard.unitName || ""
      },
      true
    ) || ""
  )
}

async function validateSpotItem(item: ISpotItem, rowLabel: string) {
  item.inspectionName = String(item.inspectionName || "").trim()
  item.inspectionCode = String(item.inspectionCode || "").trim()
  item.method = String(item.method || "").trim()
  item.inspectionFrequency = normalizeInspectionFrequency(item.inspectionFrequency)
  item.inspectionTiming = normalizeInspectionTiming(item.inspectionTiming)
  normalizeProductPayload(item)

  if (!item.inspectionName) {
    ElMessage.warning(`${rowLabel}请填写点检项名称`)
    return false
  }

  if (isProductScope(item) && !item.productIds.length) {
    ElMessage.warning(`${rowLabel}请选择适配产品`)
    return false
  }

  if (Number(item.inspectionStandard.standardType) === InspectionStandardType.Text) {
    item.inspectionStandard.standardDesc = String(item.inspectionStandard.standardDesc || "").trim()
    if (!item.inspectionStandard.standardDesc) {
      ElMessage.warning(`${rowLabel}请填写检验标准`)
      return false
    }
  } else {
    await loadUnitOptions()
    item.inspectionStandard.unitName =
      unitOptions.value.find((unit) => String(unit.value) === String(item.inspectionStandard.unitId))?.label || ""

    const errorMessage = validateQuantitativeFields(item.inspectionStandard)
    if (errorMessage) {
      ElMessage.warning(errorMessage)
      return false
    }

    const standardPayload = buildInspectionStandardPayload(
      item.inspectionStandard,
      getInspectionStandardPreview(item.inspectionStandard)
    )

    if (
      !isNumberStandardValid(
        standardPayload.standardMax,
        standardPayload.standardMin,
        !!standardPayload.standardMaxInclusive,
        !!standardPayload.standardMinInclusive
      )
    ) {
      ElMessage.warning(`${rowLabel}请完善定量检验标准`)
      return false
    }
  }

  return true
}

function mapRowToSaveParams(row: ITableRow) {
  const spotItem = cloneDeep(row.spotItem)
  normalizeProductPayload(spotItem)

  const payload: Record<string, any> = {
    mconfigType: DeviceInitSettingTabs.check,
    equipmentModelId: props.modelId,
    spotConfigValue: {
      ...spotItem,
      inspectionFrequency: normalizeInspectionFrequency(spotItem.inspectionFrequency),
      inspectionTiming: normalizeInspectionTiming(spotItem.inspectionTiming),
      productIds: spotItem.productIds,
      applicableProducts: spotItem.applicableProducts,
      inspectionStandard: buildInspectionStandardPayload(
        spotItem.inspectionStandard,
        getInspectionStandardPreview(spotItem.inspectionStandard)
      ),
      fileIds: spotItem.files.map((item) => item.fileId)
    }
  }

  if (!row.isTemp && !String(row.id).startsWith("temp-")) {
    payload.id = row.id
  }

  return payload
}

async function validateTableList() {
  const rows = cloneDeep(tableData.value)
  for (let index = 0; index < rows.length; index += 1) {
    const rowLabel = `第${index + 1}行`
    if (!(await validateSpotItem(rows[index].spotItem, rowLabel))) {
      return false
    }
  }
  return true
}

async function saveTableData() {
  if (!props.modelId) return false
  if (!(await validateTableList())) return false

  const currentRows = cloneDeep(tableData.value)
  for (const row of tableData.value) {
    await validateSpotItem(row.spotItem, "")
  }

  await editEquipmentModelConfig({
    mconfigType: DeviceInitSettingTabs.check,
    equipmentModelId: props.modelId,
    equipmentCommonConfigs: getTableSavePayload()
  })

  ElMessage.success("当前页签保存成功")
  const nextRows = await getTableData(true)
  if (currentRows.length && !nextRows?.length) {
    tableData.value = currentRows
    syncSavedSnapshot(currentRows)
  }
  emit("success")
  return true
}

async function onDialogSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const row = tableData.value.find((item) => item.id === editingRowId.value)
  if (!row) return

  const nextSpotItem = cloneDeep(dialogForm.value)
  if (!(await validateSpotItem(nextSpotItem, ""))) return
  row.spotItem = nextSpotItem
  dialogVisible.value = false
}

async function onDeleteRow(row: ITableRow) {
  const confirmed = await ElMessageBox.confirm("此操作将删除该点检项，是否继续？", "提示", {
    type: "warning"
  }).catch(() => false)
  if (!confirmed) return

  tableData.value = tableData.value.filter((item) => item.id !== row.id)
}

function onSelectProductSuccess(data: IProductModelListItem[]) {
  dialogForm.value.productIds = data.map((item) => String(item.id))
  dialogForm.value.applicableProducts = data.map((item) => normalizeProductSummary(item))
  nextTick(() => {
    formRef.value?.validateField("productIds").catch(() => false)
  })
}

watch(
  () => props.modelId,
  async (value) => {
    if (!value) {
      tableData.value = []
      syncSavedSnapshot([])
      return
    }
    await getTableData(true)
  },
  {
    immediate: true
  }
)

watch(
  isDirty,
  (value) => {
    if (!loaded.value) return
    emit("dirty-change", value)
  },
  {
    immediate: false
  }
)

defineExpose({
  getSavePayload: () => cloneData(getTableSavePayload()),
  isDirty: () => isDirty.value,
  isLoaded: () => loaded.value,
  saveTableData,
  validateTableList
})
</script>

<style scoped lang="scss">
.check-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-table {
    height: 100%;
  }
}

.table-input,
.table-select {
  width: 100%;
}

.standard-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 32px;
}

.standard-text {
  flex: 1;
  color: #606266;
  line-height: 20px;
  word-break: break-all;
}

.standard-action {
  flex-shrink: 0;
}

.standard-input-text {
  flex: 1;
}

.image-list-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.section-title:not(:first-child) {
  margin-top: 8px;
}

.mro-maintenance-config-dialog:deep(.el-dialog) {
  max-width: calc(100vw - 48px);
}

.mro-maintenance-config-dialog:deep(.el-dialog__body) {
  padding-top: 18px;
  padding-bottom: 18px;
}

.w-full {
  width: 100%;
}

.scope-product-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.scope-product-grid__left {
  display: flex;
  flex-direction: column;
}

.scope-product-grid__right {
  margin-bottom: 0;
}

.scope-product-grid__right:deep(.el-form-item__content) {
  align-items: stretch;
}

.product-field {
  width: 100%;
}

.product-selector-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-height: 92px;
  padding: 14px;
  background: #fbfcfe;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.product-selector-card:hover {
  background: #f5f9ff;
  border-color: #9ec5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

.product-selector-card__summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.product-selector-card__text {
  min-width: 0;
}

.product-selector-card__count {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #303133;
}

.product-selector-card__hint {
  font-size: 12px;
  line-height: 18px;
  color: #909399;
}

.product-selector-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.product-selector-card__select-btn {
  min-width: 68px;
  padding: 7px 14px;
  border-radius: 999px;
  border-color: rgba(64, 158, 255, 0.18);
  background: rgba(64, 158, 255, 0.1);
  color: #1d4ed8;
}

.product-selector-card__select-btn:hover,
.product-selector-card__select-btn:focus {
  background: rgba(64, 158, 255, 0.16);
  border-color: #9ec5ff;
  color: #1d4ed8;
}

.product-selector-card__clear-btn {
  padding: 6px 4px;
  color: #909399;
}

.product-selector-card__clear-btn:hover,
.product-selector-card__clear-btn:focus {
  color: #606266;
}

.product-selector-card__tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  padding-top: 2px;
  overflow: hidden;
}

.product-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.product-tag {
  margin-right: 0;
}

.product-tag--more {
  color: #1d4ed8;
  background: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.18);
}

.empty-text {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  color: #909399;
}

.quantitative-layout {
  display: grid;
  gap: 12px;
}

.quantitative-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: #fbfcfe;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.quantitative-card.is-active {
  background: #f5f9ff;
  border-color: #9ec5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

.quantitative-card.is-inactive {
  background: #fafafa;
}

.quantitative-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantitative-card__title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.mode-indicator {
  width: 14px;
  height: 14px;
  border: 2px solid #c0c4cc;
  border-radius: 50%;
  background: #fff;
}

.mode-indicator.is-active {
  border-color: #409eff;
  box-shadow: inset 0 0 0 3px #fff;
  background: #409eff;
}

.active-tag {
  padding: 1px 8px;
  font-size: 12px;
  line-height: 18px;
  color: #1d4ed8;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.18);
  border-radius: 999px;
}

.single-mode-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 10px;
}

.operator-select,
.standard-input,
.range-number,
.tolerance-sign-select {
  width: 100%;
}

.standard-range-layout {
  display: grid;
  grid-template-columns: minmax(132px, 0.86fr) minmax(220px, 1.24fr);
  gap: 10px;
}

.standard-value-card,
.tolerance-row {
  display: grid;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.standard-value-card {
  align-content: start;
}

.tolerance-stack {
  display: grid;
  gap: 10px;
}

.tolerance-row {
  grid-template-columns: 56px 76px minmax(0, 1fr);
  align-items: center;
}

.range-label {
  font-size: 13px;
  color: #606266;
}

.tolerance-row-label {
  font-size: 13px;
  color: #606266;
}

.standard-preview {
  min-height: 32px;
  width: 100%;
  padding: 6px 11px;
  line-height: 20px;
  color: #606266;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

@media (min-width: 961px) {
  .quantitative-layout {
    grid-template-columns: minmax(280px, 0.9fr) minmax(460px, 1.25fr);
    align-items: stretch;
  }
}

@media (max-width: 960px) {
  .single-mode-row,
  .standard-range-layout,
  .tolerance-row {
    grid-template-columns: 1fr;
  }
}

:deep(.table-input .el-input__wrapper),
:deep(.table-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #d8dee9 inset;
  background: #fff;
}

:deep(.table-input .el-input__wrapper:hover),
:deep(.table-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #7f8ea3 inset;
}

:deep(.table-input .el-input__wrapper.is-focus),
:deep(.table-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-table .cell) {
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
