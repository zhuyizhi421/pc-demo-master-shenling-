<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <div class="custom-table-container">
        <CustomTitle title="半轴下料卡列表">
          <div class="table-header-btn">
            <el-button type="primary" icon="Upload" @click="handleImport">导入</el-button>
            <el-button type="primary" icon="Download" @click="handleExport">导出</el-button>
            <el-button type="primary" icon="Plus" @click="handleAdd">新建下料卡</el-button>
            <el-button v-if="hasActiveSearch" type="info" link @click="clearAllSearch">清除筛选</el-button>
          </div>
        </CustomTitle>
        <el-table
          :data="tableData"
          border
          height="calc(100% - 52px)"
          v-loading="loading"
        >
          <el-table-column prop="序号" label="序号" width="70" />
          <el-table-column prop="产品名称" label="产品名称" min-width="120">
            <template #header>
              <ColumnSearch label="产品名称" v-model:visible="searchVisible.产品名称" :has-filter="hasFilter('产品名称')">
                <el-input v-model="searchParams.产品名称" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.产品名称" type="primary" link size="small" @click="clearSearch('产品名称')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="产品编号" label="产品编号" min-width="120">
            <template #header>
              <ColumnSearch label="产品编号" v-model:visible="searchVisible.产品编号" :has-filter="hasFilter('产品编号')">
                <el-input v-model="searchParams.产品编号" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.产品编号" type="primary" link size="small" @click="clearSearch('产品编号')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="半轴型号" label="半轴型号" min-width="140">
            <template #header>
              <ColumnSearch label="半轴型号" v-model:visible="searchVisible.半轴型号" :has-filter="hasFilter('半轴型号')">
                <el-input v-model="searchParams.半轴型号" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.半轴型号" type="primary" link size="small" @click="clearSearch('半轴型号')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="棒料编号" label="棒料编号" width="120">
            <template #header>
              <ColumnSearch label="棒料编号" v-model:visible="searchVisible.棒料编号" :has-filter="hasFilter('棒料编号')">
                <el-input v-model="searchParams.棒料编号" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.棒料编号" type="primary" link size="small" @click="clearSearch('棒料编号')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="棒料规格直径" label="棒料规格-直径(mm)" width="140">
            <template #header>
              <ColumnSearch label="棒料规格-直径(mm)" v-model:visible="searchVisible.棒料规格直径" :has-filter="hasFilter('棒料规格直径')">
                <el-input v-model="searchParams.棒料规格直径" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.棒料规格直径" type="primary" link size="small" @click="clearSearch('棒料规格直径')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="棒料规格尺寸" label="棒料规格-尺寸" width="100">
            <template #header>
              <ColumnSearch label="棒料规格-尺寸" v-model:visible="searchVisible.棒料规格尺寸" :has-filter="hasFilter('棒料规格尺寸')">
                <el-input v-model="searchParams.棒料规格尺寸" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.棒料规格尺寸" type="primary" link size="small" @click="clearSearch('棒料规格尺寸')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="材料牌号" label="材料牌号" width="100">
            <template #header>
              <ColumnSearch label="材料牌号" v-model:visible="searchVisible.材料牌号" :has-filter="hasFilter('材料牌号')">
                <el-input v-model="searchParams.材料牌号" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.材料牌号" type="primary" link size="small" @click="clearSearch('材料牌号')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="下料尺寸" label="下料尺寸(mm)" width="110">
            <template #header>
              <ColumnSearch label="下料尺寸" v-model:visible="searchVisible.下料尺寸" :has-filter="hasFilter('下料尺寸')">
                <el-input v-model="searchParams.下料尺寸" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.下料尺寸" type="primary" link size="small" @click="clearSearch('下料尺寸')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="公差" label="公差" width="80">
            <template #header>
              <ColumnSearch label="公差" v-model:visible="searchVisible.公差" :has-filter="hasFilter('公差')">
                <el-input v-model="searchParams.公差" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.公差" type="primary" link size="small" @click="clearSearch('公差')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="锯片厚度" label="锯片厚度(mm)" width="110">
            <template #header>
              <ColumnSearch label="锯片厚度" v-model:visible="searchVisible.锯片厚度" :has-filter="hasFilter('锯片厚度')">
                <el-input v-model="searchParams.锯片厚度" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.锯片厚度" type="primary" link size="small" @click="clearSearch('锯片厚度')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="料头料尾切割厚度" label="料头料尾切割厚度(mm)" width="160">
            <template #header>
              <ColumnSearch label="料头料尾切割厚度" v-model:visible="searchVisible.料头料尾切割厚度" :has-filter="hasFilter('料头料尾切割厚度')">
                <el-input v-model="searchParams.料头料尾切割厚度" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.料头料尾切割厚度" type="primary" link size="small" @click="clearSearch('料头料尾切割厚度')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="下料根数" label="下料根数" width="90">
            <template #header>
              <ColumnSearch label="下料根数" v-model:visible="searchVisible.下料根数" :has-filter="hasFilter('下料根数')">
                <el-input v-model="searchParams.下料根数" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.下料根数" type="primary" link size="small" @click="clearSearch('下料根数')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="套料产品" label="套料产品" width="120">
            <template #header>
              <ColumnSearch label="套料产品" v-model:visible="searchVisible.套料产品" :has-filter="hasFilter('套料产品')">
                <el-input v-model="searchParams.套料产品" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.套料产品" type="primary" link size="small" @click="clearSearch('套料产品')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="套料数量" label="套料数量" width="90">
            <template #header>
              <ColumnSearch label="套料数量" v-model:visible="searchVisible.套料数量" :has-filter="hasFilter('套料数量')">
                <el-input v-model="searchParams.套料数量" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.套料数量" type="primary" link size="small" @click="clearSearch('套料数量')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="套料长度" label="套料长度(mm)" width="110">
            <template #header>
              <ColumnSearch label="套料长度" v-model:visible="searchVisible.套料长度" :has-filter="hasFilter('套料长度')">
                <el-input v-model="searchParams.套料长度" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.套料长度" type="primary" link size="small" @click="clearSearch('套料长度')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="套料公差" label="套料公差" width="90">
            <template #header>
              <ColumnSearch label="套料公差" v-model:visible="searchVisible.套料公差" :has-filter="hasFilter('套料公差')">
                <el-input v-model="searchParams.套料公差" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.套料公差" type="primary" link size="small" @click="clearSearch('套料公差')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="备注" label="备注" min-width="150">
            <template #header>
              <ColumnSearch label="备注" v-model:visible="searchVisible.备注" :has-filter="hasFilter('备注')">
                <el-input v-model="searchParams.备注" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.备注" type="primary" link size="small" @click="clearSearch('备注')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="料头长度" label="料头长度(mm)" width="110">
            <template #header>
              <ColumnSearch label="料头长度" v-model:visible="searchVisible.料头长度" :has-filter="hasFilter('料头长度')">
                <el-input v-model="searchParams.料头长度" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.料头长度" type="primary" link size="small" @click="clearSearch('料头长度')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="尾料长度" label="尾料长度(mm)" width="110">
            <template #header>
              <ColumnSearch label="尾料长度" v-model:visible="searchVisible.尾料长度" :has-filter="hasFilter('尾料长度')">
                <el-input v-model="searchParams.尾料长度" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.尾料长度" type="primary" link size="small" @click="clearSearch('尾料长度')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="材料利用率" label="材料利用率" width="100">
            <template #default="{ row }">
              <span :class="{ 'low-util-rate-cell': isLowUtilRate(row['材料利用率']) }">
                {{ row['材料利用率'] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <div class="operation-btns">
                <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无数据，请点击导入按钮加载Excel文件" />
          </template>
        </el-table>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="handlePageChange"
      />

      <!-- 导入对话框 -->
      <el-dialog v-model="importDialogVisible" title="导入半轴下料卡" width="500px">
        <div class="import-content">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .xlsx, .xls 格式文件，请按照模板格式整理数据</div>
            </template>
          </el-upload>
          <div class="template-tip">
            <el-button type="info" link @click="downloadTemplate">下载导入模板</el-button>
          </div>
        </div>
        <template #footer>
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="importLoading" @click="confirmImport">确认导入</el-button>
        </template>
      </el-dialog>

      <!-- 编辑对话框 -->
      <el-dialog v-model="editDialogVisible" title="编辑半轴下料卡" width="800px" destroy-on-close>
        <el-form :model="editForm" label-width="140px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品名称">
                <el-input v-model="editForm.产品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品编号">
                <el-input v-model="editForm.产品编号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="半轴型号">
                <el-select
                  v-model="editForm.半轴型号"
                  placeholder="请选择半轴型号"
                  filterable
                  allow-create
                  default-first-option
                  @change="handleShaftModelChange"
                >
                  <el-option
                    v-for="item in shaftModelOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="棒料编号">
                <el-input v-model="editForm.棒料编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="棒料规格-直径">
                <el-input v-model="editForm.棒料规格直径" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="棒料规格-尺寸">
                <el-input v-model="editForm.棒料规格尺寸" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="材料牌号">
                <el-input v-model="editForm.材料牌号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="下料尺寸(mm)">
                <el-input v-model="editForm.下料尺寸" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公差">
                <el-input v-model="editForm.公差" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="锯片厚度(mm)">
                <el-input v-model="editForm.锯片厚度" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="料头料尾切割厚度">
                <el-input v-model="editForm.料头料尾切割厚度" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="下料根数">
                <el-input v-model="editForm.下料根数" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="套料产品">
                <el-input v-model="editForm.套料产品" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="套料数量">
                <el-input v-model="editForm.套料数量" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="套料长度(mm)">
                <el-input v-model="editForm.套料长度" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="套料公差">
                <el-input v-model="editForm.套料公差" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注">
                <el-input v-model="editForm.备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit">保存</el-button>
        </template>
      </el-dialog>

      <!-- 新建对话框 -->
      <el-dialog v-model="addDialogVisible" title="新建下料卡" width="800px" destroy-on-close>
        <el-form :model="addForm" label-width="140px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="产品名称">
                <el-select
                  v-model="addForm.产品名称"
                  placeholder="请选择产品名称"
                  filterable
                  allow-create
                  default-first-option
                  @change="handleAddProductNameChange"
                >
                  <el-option
                    v-for="item in productNameOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品编号">
                <el-input v-model="addForm.产品编号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="半轴型号">
                <el-select
                  v-model="addForm.半轴型号"
                  placeholder="请选择半轴型号"
                  filterable
                  allow-create
                  default-first-option
                  @change="handleAddShaftModelChange"
                >
                  <el-option
                    v-for="item in shaftModelOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="棒料编号">
                <el-input v-model="addForm.棒料编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="棒料规格-直径">
                <el-input v-model="addForm.棒料规格直径" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="棒料规格-尺寸">
                <el-input v-model="addForm.棒料规格尺寸" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="材料牌号">
                <el-input v-model="addForm.材料牌号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="下料尺寸(mm)">
                <el-input v-model="addForm.下料尺寸" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公差">
                <el-input v-model="addForm.公差" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="锯片厚度(mm)">
                <el-input v-model="addForm.锯片厚度" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="料头料尾切割厚度">
                <el-input v-model="addForm.料头料尾切割厚度" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="下料根数">
                <el-input v-model="addForm.下料根数" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="套料产品">
                <el-input v-model="addForm.套料产品" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="套料数量">
                <el-input v-model="addForm.套料数量" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="套料长度(mm)">
                <el-input v-model="addForm.套料长度" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="套料公差">
                <el-input v-model="addForm.套料公差" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注">
                <el-input v-model="addForm.备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import * as XLSX from "xlsx"

import { createProductCate, createProductModel, getCategoryTree, getUnitSelectOptions, queryProductModelPageList, queryProductTypeList } from "@/api/product"
import ColumnSearch from "./components/ColumnSearch.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"

defineOptions({
  name: "SemiAxleBlankingCard"
})

// 搜索参数
const searchParams = reactive<Record<string, string>>({
  产品名称: "",
  产品编号: "",
  半轴型号: "",
  棒料编号: "",
  棒料规格直径: "",
  棒料规格尺寸: "",
  材料牌号: "",
  下料尺寸: "",
  公差: "",
  锯片厚度: "",
  料头料尾切割厚度: "",
  下料根数: "",
  套料产品: "",
  套料数量: "",
  套料长度: "",
  套料公差: "",
  备注: "",
  料头长度: "",
  尾料长度: ""
})

// 搜索弹窗显示状态
const searchVisible = reactive<Record<string, boolean>>({
  半轴型号: false,
  棒料编号: false,
  棒料规格直径: false,
  棒料规格尺寸: false,
  材料牌号: false,
  下料尺寸: false,
  公差: false,
  锯片厚度: false,
  料头料尾切割厚度: false,
  下料根数: false,
  套料产品: false,
  套料数量: false,
  套料长度: false,
  套料公差: false,
  备注: false,
  料头长度: false,
  尾料长度: false
})

// 判断是否有筛选
const hasFilter = (key: string) => {
  return !!searchParams[key]
}

// 判断是否有激活的搜索
const hasActiveSearch = computed(() => {
  return Object.values(searchParams).some(v => !!v)
})

// 清除单个搜索
const clearSearch = (key: string) => {
  searchParams[key] = ""
  handleSearch()
}

// 清除所有搜索
const clearAllSearch = () => {
  Object.keys(searchParams).forEach(key => {
    searchParams[key] = ""
  })
  handleSearch()
}

// 加载状态
const loading = ref(false)

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

// 表格数据
const tableData = ref<any[]>([])
const allData = ref<any[]>([])
const originalData = ref<any[]>([]) // 保留原始数据，用于清除筛选后恢复

// 导入相关
const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref()
const fileList = ref<any[]>([])
const selectedFile = ref<File | null>(null)

// 编辑相关
const editDialogVisible = ref(false)
const editIndex = ref(-1)
const shaftModelOptions = ref<string[]>([])
const productNameOptions = ref<string[]>([]) // 产品名称下拉选项

// 提取产品名称选项
const extractProductNameOptions = () => {
  const names = new Set<string>()
  allData.value.forEach(item => {
    if (item["产品名称"]) {
      names.add(item["产品名称"])
    }
  })
  productNameOptions.value = Array.from(names).sort()
}

// 新建相关
const addDialogVisible = ref(false)
const addForm = reactive({
  产品名称: "",
  产品编号: "",
  半轴型号: "",
  棒料编号: "",
  棒料规格直径: "",
  棒料规格尺寸: "",
  材料牌号: "",
  下料尺寸: "",
  公差: "",
  锯片厚度: "",
  料头料尾切割厚度: "",
  下料根数: "",
  套料产品: "",
  套料数量: "",
  套料长度: "",
  套料公差: "",
  备注: ""
})

// 提取半轴型号选项
const extractShaftModelOptions = () => {
  const models = new Set<string>()
  allData.value.forEach(item => {
    if (item["半轴型号"]) {
      models.add(item["半轴型号"])
    }
  })
  shaftModelOptions.value = Array.from(models).sort()
}

// 半轴型号变更时自动填充已有数据
const handleShaftModelChange = (value: string) => {
  const existingRow = allData.value.find(item => item["半轴型号"] === value)
  if (existingRow) {
    Object.assign(editForm, {
      棒料编号: existingRow["棒料编号"],
      棒料规格直径: existingRow["棒料规格直径"],
      棒料规格尺寸: existingRow["棒料规格尺寸"],
      材料牌号: existingRow["材料牌号"],
      下料尺寸: existingRow["下料尺寸"],
      公差: existingRow["公差"],
      锯片厚度: existingRow["锯片厚度"],
      料头料尾切割厚度: existingRow["料头料尾切割厚度"],
      下料根数: existingRow["下料根数"],
      套料产品: existingRow["套料产品"],
      套料数量: existingRow["套料数量"],
      套料长度: existingRow["套料长度"],
      套料公差: existingRow["套料公差"]
    })
  }
}

const editForm = reactive({
  产品名称: "",
  产品编号: "",
  半轴型号: "",
  棒料编号: "",
  棒料规格直径: "",
  棒料规格尺寸: "",
  材料牌号: "",
  下料尺寸: "",
  公差: "",
  锯片厚度: "",
  料头料尾切割厚度: "",
  下料根数: "",
  套料产品: "",
  套料数量: "",
  套料长度: "",
  套料公差: "",
  备注: ""
})

// 编辑
const handleEdit = (row: any) => {
  // 提取半轴型号选项
  extractShaftModelOptions()

  editIndex.value = allData.value.findIndex(item => item.序号 === row.序号)
  Object.assign(editForm, {
    半轴型号: row.半轴型号,
    棒料编号: row.棒料编号,
    棒料规格直径: row.棒料规格直径,
    棒料规格尺寸: row.棒料规格尺寸,
    材料牌号: row.材料牌号,
    下料尺寸: row.下料尺寸,
    公差: row.公差,
    锯片厚度: row.锯片厚度,
    料头料尾切割厚度: row.料头料尾切割厚度,
    下料根数: row.下料根数,
    套料产品: row.套料产品,
    套料数量: row.套料数量,
    套料长度: row.套料长度,
    套料公差: row.套料公差,
    备注: row.备注
  })
  editDialogVisible.value = true
}

// 确认编辑
const confirmEdit = () => {
  if (editIndex.value === -1) return

  // 计算自动字段
  const calculated = calculateFields(editForm)

  // 更新数据
  allData.value[editIndex.value] = {
    ...allData.value[editIndex.value],
    ...editForm,
    ...calculated
  }
  // 同步更新原始数据
  originalData.value = [...allData.value]

  // 保存到本地
  saveToLocal()

  // 刷新表格
  handlePageChange()

  editDialogVisible.value = false
  ElMessage.success("保存成功")
}

// 新建
const handleAdd = () => {
  // 提取半轴型号选项
  extractShaftModelOptions()
  // 提取产品名称选项
  extractProductNameOptions()
  // 重置表单
  Object.assign(addForm, {
    产品名称: "",
    产品编号: "",
    半轴型号: "",
    棒料规格直径: "",
    棒料规格尺寸: "",
    材料牌号: "",
    下料尺寸: "",
    公差: "",
    锯片厚度: "",
    料头料尾切割厚度: "",
    下料根数: "",
    套料产品: "",
    套料数量: "",
    套料长度: "",
    套料公差: "",
    备注: ""
  })
  addDialogVisible.value = true
}

// 新建时产品名称变更 - 选择产品后自动带出产品编号和半轴型号
const handleAddProductNameChange = (value: string) => {
  const existingRow = allData.value.find(item => item["产品名称"] === value)
  if (existingRow) {
    Object.assign(addForm, {
      产品编号: existingRow["产品编号"],
      半轴型号: existingRow["半轴型号"]
    })
  } else {
    // 清空产品编号和半轴型号
    addForm.产品编号 = ""
    addForm.半轴型号 = ""
  }
}

// 新建时半轴型号变更
const handleAddShaftModelChange = (value: string) => {
  const existingRow = allData.value.find(item => item["半轴型号"] === value)
  if (existingRow) {
    Object.assign(addForm, {
      棒料编号: existingRow["棒料编号"],
      棒料规格直径: existingRow["棒料规格直径"],
      棒料规格尺寸: existingRow["棒料规格尺寸"],
      材料牌号: existingRow["材料牌号"],
      下料尺寸: existingRow["下料尺寸"],
      公差: existingRow["公差"],
      锯片厚度: existingRow["锯片厚度"],
      料头料尾切割厚度: existingRow["料头料尾切割厚度"],
      下料根数: existingRow["下料根数"],
      套料产品: existingRow["套料产品"],
      套料数量: existingRow["套料数量"],
      套料长度: existingRow["套料长度"],
      套料公差: existingRow["套料公差"]
    })
  }
}

// 计算料头长度、尾料长度、材料利用率
const calculateFields = (row: any) => {
  const 原材料长度 = Number(row["棒料规格尺寸"]) || 0
  const 下料尺寸 = Number(row["下料尺寸"]) || 0
  const 锯片厚度 = Number(row["锯片厚度"]) || 0
  const 料头料尾切割厚度 = Number(row["料头料尾切割厚度"]) || 0
  const 下料根数 = Number(row["下料根数"]) || 0
  const 套料数量 = Number(row["套料数量"]) || 0
  const 套料长度 = Number(row["套料长度"]) || 0

  // 料头长度 = 原材料长度 - (下料尺寸 + 锯片厚度) × 下料根数 - 套料数量 × 套料长度 - 锯片厚度 × 套料数量
  const 料头长度 = 原材料长度 - (下料尺寸 + 锯片厚度) * 下料根数 - 套料数量 * 套料长度 - 锯片厚度 * 套料数量

  // 尾料长度 = 料头长度 - 料头料尾切割厚度
  const 尾料长度 = 料头长度 - 料头料尾切割厚度

  // 材料利用率 = (原材料长度 - 料头长度) / 原材料长度
  const 材料利用率 = 原材料长度 > 0 ? (原材料长度 - 料头长度) / 原材料长度 : 0

  return {
    料头长度: 料头长度.toFixed(2),
    尾料长度: 尾料长度.toFixed(2),
    材料利用率: (材料利用率 * 100).toFixed(2) + "%"
  }
}

// 确认新建
const confirmAdd = () => {
  // 生成新序号
  const newNo = allData.value.length > 0 ? Math.max(...allData.value.map(item => item.序号)) + 1 : 1

  // 计算自动字段
  const calculated = calculateFields(addForm)

  // 创建新数据
  const newRow = {
    序号: newNo,
    ...addForm,
    ...calculated
  }

  // 添加到数据末尾
  allData.value.push(newRow)
  // 同步更新原始数据
  originalData.value = [...allData.value]

  // 保存到本地
  saveToLocal()

  // 更新分页
  pagination.value.total = allData.value.length

  // 跳转到最后一页
  pagination.value.currentPage = Math.ceil(allData.value.length / pagination.value.pageSize)
  handlePageChange()

  addDialogVisible.value = false
  ElMessage.success("新建成功")
}

// 同步创建产品
const syncLoading = ref(false)
const syncCreateProducts = async () => {
  try {
    await ElMessageBox.confirm("将根据半轴下料卡数据创建产品，确定要继续吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })

    syncLoading.value = true
    ElMessage.info("开始同步，请稍候...")

    // 获取产品分类树
    console.log("获取产品分类树...")
    const categoryTree = await getCategoryTree()
    console.log("分类树:", categoryTree)

    // 查找"成品"下的"半轴"分类
    let halfShaftCategoryId = ""
    let finishedProductId = ""
    if (categoryTree && Array.isArray(categoryTree)) {
      const finishedProduct = categoryTree.find((item: any) => item.name === "成品")
      if (finishedProduct) {
        finishedProductId = finishedProduct.id
        if (finishedProduct?.children) {
          const halfShaft = finishedProduct.children.find((item: any) => item.name === "半轴")
          if (halfShaft) {
            halfShaftCategoryId = halfShaft.id
          }
        }
      }
    }
    console.log("成品分类ID:", finishedProductId)
    console.log("半轴分类ID:", halfShaftCategoryId)

    // 查找"原材料"分类
    let rawMaterialCategoryId = ""
    if (categoryTree && Array.isArray(categoryTree)) {
      const rawMaterial = categoryTree.find((item: any) => item.name === "原材料")
      if (rawMaterial) {
        rawMaterialCategoryId = rawMaterial.id
      }
    }
    console.log("原材料分类ID:", rawMaterialCategoryId)

    // 如果原材料分类不存在，则创建（本地模拟）
    if (!rawMaterialCategoryId) {
      rawMaterialCategoryId = "raw-material-category-" + Date.now()
    }

    // 获取产品类型列表，找到"原材料"类型ID
    const productTypeList = await queryProductTypeList()
    console.log("产品类型列表:", productTypeList)
    let rawMaterialTypeId = 0
    if (productTypeList && Array.isArray(productTypeList)) {
      const rawMaterialType = productTypeList.find((item: any) => item.productType === "原材料")
      if (rawMaterialType) {
        rawMaterialTypeId = rawMaterialType.id
      }
    }
    console.log("原材料产品类型ID:", rawMaterialTypeId)

    // 如果半轴分类不存在，则创建（本地模拟）
    if (!halfShaftCategoryId) {
      if (!finishedProductId) {
        ElMessage.error("未找到产品分类：成品，请先在产品管理中创建该分类")
        return
      }
      // 本地模拟创建分类ID
      halfShaftCategoryId = "half-shaft-category-" + Date.now()
      ElMessage.warning("后端API无法创建分类，将使用本地模拟ID继续创建产品")
    }

    if (!halfShaftCategoryId) {
      ElMessage.error("无法获取半轴分类ID，请手动在产品类别中创建")
      return
    }

    // 获取单位列表
    console.log("获取单位列表...")
    const unitList = await getUnitSelectOptions()
    console.log("单位列表:", unitList)
    // 打印所有单位名称
    if (unitList && unitList.length > 0) {
      console.log("所有单位名称:", unitList.map((item: any) => item.unitName))
    }
    // 尝试多种可能的单位名称，如果没有则使用第一个
    let rootUnit = unitList?.find((item: any) =>
      item.unitName === "件" ||
      item.unitName === "根" ||
      item.unitName === "个" ||
      item.unitName === "台" ||
      item.unitName === "箱" ||
      item.unitName === "千克" ||
      item.unitName === "套"
    )
    console.log("选中的单位:", rootUnit)
    if (!rootUnit && unitList && unitList.length > 0) {
      rootUnit = unitList[0]
      console.log("使用第一个单位:", rootUnit.unitName)
    }
    if (!rootUnit) {
      ElMessage.error("未找到任何单位")
      return
    }

    // 获取已有产品列表（用于检查重复）
    console.log("获取已有产品列表...")
    const existingProducts = await queryProductModelPageList({
      pageQuery: { pageNum: 1, pageSize: 9999 },
      queryParam: {}
    })
    console.log("已有产品:", existingProducts?.records?.length)
    const existingNames = new Set(existingProducts?.records?.map((item: any) =>
      item.name + "-" + item.productModel + "-" + item.specification
    ) || [])

    // 获取本地已创建的产品，避免重复创建
    const localCreatedProducts = loadProductsFromLocal()
    localCreatedProducts.forEach((p: any) => {
      existingNames.add(p.name + "-" + p.productModel + "-" + p.specification)
    })
    console.log("本地已创建产品:", localCreatedProducts.length)

    // 遍历半轴下料卡数据，创建产品
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const createdProducts: any[] = []

    // 先收集所有唯一的套料产品信息（按套料产品型号分组，只取套料数量>0的第一条）
    const tailingProductsMap = new Map<string, any>()
    for (const row of allData.value) {
      const 套料产品 = row["套料产品"]
      const 套料数量 = parseInt(row["套料数量"]) || 0
      const 套料长度 = row["套料长度"]

      // 只收集套料数量>0且有套料长度的记录
      if (套料产品 && 套料数量 > 0 && 套料长度 && !tailingProductsMap.has(套料产品)) {
        console.log("收集套料产品:", 套料产品, "规格:", row["棒料规格直径"] + "*" + 套料长度)
        tailingProductsMap.set(套料产品, {
          套料产品,
          棒料规格直径: row["棒料规格直径"],
          套料长度: 套料长度,
          材料牌号: row["材料牌号"]
        })
      }
    }
    console.log("套料产品Map:", Array.from(tailingProductsMap.keys()))

    // 创建半轴产品
    for (const row of allData.value) {
      const 产品型号 = `${row["半轴型号"]}`
      const 产品规格 = `${row["棒料规格直径"]}*${row["棒料规格尺寸"]}`
      const 产品名称 = "半轴"
      const 产品全名 = `${产品名称}-${产品型号}-${产品规格}`

      // 跳过同时也是套料产品的型号（只创建套料产品，不创建主产品）
      if (tailingProductsMap.has(产品型号)) {
        console.log("跳过主产品（同时是套料产品）:", 产品型号)
        skipCount++
        continue
      }

      // 检查重复
      if (existingNames.has(产品全名)) {
        skipCount++
        continue
      }

      try {
        // 生成产品编号
        const 产品编号 = `SX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

        console.log("创建产品:", 产品全名, 产品编号)

        // 创建产品对象
        const product = {
          id: 产品编号,
          name: 产品名称,
          productModel: 产品型号,
          specification: 产品规格,
          code: 产品编号,
          productCategoryId: halfShaftCategoryId,
          categoryName: "半轴",
          defaultUnitId: rootUnit.id,
          unitName: rootUnit.unitName,
          remark: `材料牌号：${row["材料牌号"]}`,
          status: 1,
          createTime: new Date().toISOString()
        }

        createdProducts.push(product)
        existingNames.add(产品全名)
        successCount++
      } catch (error: any) {
        console.error(`创建产品失败: ${产品全名}`, error)
        errorCount++
      }
    }

    // 创建套料产品（只创建唯一的套料产品，每个套料产品型号只创建一次）
    console.log("开始创建套料产品，Map大小:", tailingProductsMap.size)
    for (const [_, tailingInfo] of tailingProductsMap) {
      const 套料产品 = tailingInfo.套料产品
      const 套料规格 = `${tailingInfo.棒料规格直径}*${tailingInfo.套料长度}`
      // 套料产品名称为"半轴"，与半轴产品区分的是productModel（套料产品型号）
      const 套料产品全名 = `半轴-${套料产品}-${套料规格}`

      console.log("检查套料产品:", 套料产品全名, "是否已存在:", existingNames.has(套料产品全名))

      if (!existingNames.has(套料产品全名)) {
        try {
          const 套料产品编号 = `TL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

          console.log("创建套料产品:", 套料产品全名, 套料产品编号)

          const tailingProduct = {
            id: 套料产品编号,
            name: "半轴",
            productModel: 套料产品,
            specification: 套料规格,
            code: 套料产品编号,
            productCategoryId: halfShaftCategoryId,
            categoryName: "半轴",
            productType: rawMaterialTypeId,
            defaultUnitId: rootUnit.id,
            unitName: rootUnit.unitName,
            remark: `材料牌号：${tailingInfo.材料牌号}（套料产品）`,
            status: 1,
            createTime: new Date().toISOString()
          }

          createdProducts.push(tailingProduct)
          existingNames.add(套料产品全名)
          successCount++
        } catch (error: any) {
          console.error(`创建套料产品失败: ${套料产品全名}`, error)
          errorCount++
        }
      } else {
        skipCount++
      }
    }

    // 保存到localStorage
    if (createdProducts.length > 0) {
      const existingProducts = loadProductsFromLocal()
      const allProducts = [...existingProducts, ...createdProducts]
      saveProductsToLocal(allProducts)
      console.log("已保存产品到本地存储:", allProducts.length)
    }

    syncLoading.value = false
    ElMessage.success(`创建完成：成功${successCount}条，跳过${skipCount}条，失败${errorCount}条`)
  } catch (error: any) {
    syncLoading.value = false
    if (error !== "cancel") {
      console.error("同步创建产品失败:", error)
      ElMessage.error(error?.message || "同步创建产品失败，请查看控制台日志")
    }
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认要删除该条数据吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const index = allData.value.findIndex(item => item.序号 === row.序号)
    if (index !== -1) {
      allData.value.splice(index, 1)
      // 同步更新原始数据
      originalData.value = [...allData.value]
      // 重新计算序号
      allData.value.forEach((item, idx) => {
        item.序号 = idx + 1
      })
      // 保存到本地
      saveToLocal()
      // 更新分页
      pagination.value.total = allData.value.length
      // 如果当前页码大于总页数，重置到第一页
      const totalPages = Math.ceil(pagination.value.total / pagination.value.pageSize)
      if (pagination.value.currentPage > totalPages && totalPages > 0) {
        pagination.value.currentPage = totalPages
      } else if (pagination.value.total === 0) {
        pagination.value.currentPage = 1
      }
      handlePageChange()
      ElMessage.success("删除成功")
    }
  }).catch(() => {})
}

// 解析Excel数据
const parseExcelData = (workbook: XLSX.WorkBook): any[] => {
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0 }) as any[][]

  if (jsonData.length < 3) {
    return []
  }

  const dataList: any[] = []
  for (let i = 2; i < jsonData.length; i++) {
    const row = jsonData[i]
    if (!row || row.length === 0 || !row[1]) continue

    const 料头长度原始 = row[15]
    const 尾料长度原始 = row[16]
    const 材料利用率原始 = row[17]

    let 料头长度 = ""
    let 尾料长度 = ""
    let 材料利用率 = ""

    if (料头长度原始 !== undefined && 料头长度原始 !== null && 料头长度原始 !== "") {
      料头长度 = Number(料头长度原始).toFixed(2)
    }
    if (尾料长度原始 !== undefined && 尾料长度原始 !== null && 尾料长度原始 !== "") {
      const tailLength = Number(尾料长度原始)
      尾料长度 = tailLength < 0 ? "0.00" : tailLength.toFixed(2)
    }
    if (材料利用率原始 !== undefined && 材料利用率原始 !== null && 材料利用率原始 !== "") {
      const utilRate = Number(材料利用率原始)
      材料利用率 = (utilRate * 100).toFixed(2) + "%"
    }

    const rowData: any = {
      序号: i - 1,
      产品名称: "",
      产品编号: "",
      半轴型号: row[1] || "",
      棒料编号: "", // Excel中无此列，保留字段但为空
      棒料规格直径: row[2] || "",
      棒料规格尺寸: row[3] || "",
      材料牌号: row[4] || "",
      下料尺寸: row[5] || "",
      公差: row[6] || "",
      锯片厚度: row[7] || "",
      料头料尾切割厚度: row[8] || "",
      下料根数: row[9] || "",
      套料产品: row[10] || "",
      套料数量: row[11] || "",
      套料长度: row[12] || "",
      套料公差: row[13] || "",
      备注: row[14] || "",
      料头长度: 料头长度,
      尾料长度: 尾料长度,
      材料利用率: 材料利用率
    }

    dataList.push(rowData)
  }

  return dataList
}

// 判断材料利用率是否低于95%
const isLowUtilRate = (value: string) => {
  if (!value) return false
  const num = parseFloat(value.replace("%", ""))
  return num < 95
}

// 搜索过滤
const handleSearch = () => {
  let filteredData = [...originalData.value]

  // 产品名称
  if (searchParams.产品名称) {
    filteredData = filteredData.filter(item =>
      item["产品名称"]?.toString().toLowerCase().includes(searchParams.产品名称.toLowerCase())
    )
  }
  // 产品编号
  if (searchParams.产品编号) {
    filteredData = filteredData.filter(item =>
      item["产品编号"]?.toString().toLowerCase().includes(searchParams.产品编号.toLowerCase())
    )
  }
  // 半轴型号
  if (searchParams.半轴型号) {
    filteredData = filteredData.filter(item =>
      item["半轴型号"]?.toString().toLowerCase().includes(searchParams.半轴型号.toLowerCase())
    )
  }
  // 棒料规格直径
  if (searchParams.棒料规格直径) {
    filteredData = filteredData.filter(item =>
      item["棒料规格直径"]?.toString().toLowerCase().includes(searchParams.棒料规格直径.toLowerCase())
    )
  }
  // 棒料规格尺寸
  if (searchParams.棒料规格尺寸) {
    filteredData = filteredData.filter(item =>
      item["棒料规格尺寸"]?.toString().toLowerCase().includes(searchParams.棒料规格尺寸.toLowerCase())
    )
  }
  // 材料牌号
  if (searchParams.材料牌号) {
    filteredData = filteredData.filter(item =>
      item["材料牌号"]?.toString().toLowerCase().includes(searchParams.材料牌号.toLowerCase())
    )
  }
  // 下料尺寸
  if (searchParams.下料尺寸) {
    filteredData = filteredData.filter(item =>
      item["下料尺寸"]?.toString().toLowerCase().includes(searchParams.下料尺寸.toLowerCase())
    )
  }
  // 公差
  if (searchParams.公差) {
    filteredData = filteredData.filter(item =>
      item["公差"]?.toString().toLowerCase().includes(searchParams.公差.toLowerCase())
    )
  }
  // 锯片厚度
  if (searchParams.锯片厚度) {
    filteredData = filteredData.filter(item =>
      item["锯片厚度"]?.toString().toLowerCase().includes(searchParams.锯片厚度.toLowerCase())
    )
  }
  // 料头料尾切割厚度
  if (searchParams.料头料尾切割厚度) {
    filteredData = filteredData.filter(item =>
      item["料头料尾切割厚度"]?.toString().toLowerCase().includes(searchParams.料头料尾切割厚度.toLowerCase())
    )
  }
  // 下料根数
  if (searchParams.下料根数) {
    filteredData = filteredData.filter(item =>
      item["下料根数"]?.toString().toLowerCase().includes(searchParams.下料根数.toLowerCase())
    )
  }
  // 套料产品
  if (searchParams.套料产品) {
    filteredData = filteredData.filter(item =>
      item["套料产品"]?.toString().toLowerCase().includes(searchParams.套料产品.toLowerCase())
    )
  }
  // 套料数量
  if (searchParams.套料数量) {
    filteredData = filteredData.filter(item =>
      item["套料数量"]?.toString().toLowerCase().includes(searchParams.套料数量.toLowerCase())
    )
  }
  // 套料长度
  if (searchParams.套料长度) {
    filteredData = filteredData.filter(item =>
      item["套料长度"]?.toString().toLowerCase().includes(searchParams.套料长度.toLowerCase())
    )
  }
  // 套料公差
  if (searchParams.套料公差) {
    filteredData = filteredData.filter(item =>
      item["套料公差"]?.toString().toLowerCase().includes(searchParams.套料公差.toLowerCase())
    )
  }
  // 备注
  if (searchParams.备注) {
    filteredData = filteredData.filter(item =>
      item["备注"]?.toString().toLowerCase().includes(searchParams.备注.toLowerCase())
    )
  }
  // 料头长度
  if (searchParams.料头长度) {
    filteredData = filteredData.filter(item =>
      item["料头长度"]?.toString().toLowerCase().includes(searchParams.料头长度.toLowerCase())
    )
  }
  // 尾料长度
  if (searchParams.尾料长度) {
    filteredData = filteredData.filter(item =>
      item["尾料长度"]?.toString().toLowerCase().includes(searchParams.尾料长度.toLowerCase())
    )
  }

  pagination.value.currentPage = 1
  pagination.value.total = filteredData.length
  // 使用原始数据筛选，避免清除筛选时数据丢失
  allData.value = filteredData
  handlePageChange()
}

// 本地存储key
const STORAGE_KEY = "semi-axle-blanking-data"
const PRODUCTS_STORAGE_KEY = "semi-axle-products"

// 保存产品到本地
const saveProductsToLocal = (products: any[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    console.error("保存产品到本地失败:", error)
  }
}

// 从本地加载产品
const loadProductsFromLocal = () => {
  try {
    const data = localStorage.getItem(PRODUCTS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("从本地加载产品失败:", error)
    return []
  }
}

// 保存数据到本地
const saveToLocal = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData.value))
  } catch (error) {
    console.error("保存数据到本地失败:", error)
  }
}

// 从本地加载数据
const loadFromLocal = (): any[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("从本地加载数据失败:", error)
    return null
  }
}


// 从URL加载Excel文件
const loadData = async () => {
  try {
    loading.value = true
    const response = await fetch("/semi-axle-blanking.xlsx")
    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    const parsedData = parseExcelData(workbook)

    // 去重：删除完全相同的行
    allData.value = removeDuplicateRows(parsedData)
    // 保存原始数据，用于清除筛选后恢复
    originalData.value = [...allData.value]

    // 保存到本地
    saveToLocal()

    pagination.value.total = allData.value.length

    // 清除所有搜索
    clearAllSearch()
    handlePageChange()
    ElMessage.success(`加载成功，共 ${allData.value.length} 条数据`)
  } catch (error) {
    console.error("加载Excel文件失败:", error)
    ElMessage.error("加载数据失败，请确保Excel文件存在于public目录下")
  } finally {
    loading.value = false
  }
}

// 匹配产品信息
const matchProductInfo = async () => {
  if (allData.value.length === 0) {
    ElMessage.warning("没有数据可匹配")
    return
  }

  loading.value = true
  try {
    // 加载BOM Excel（从public目录，需要先将BOM文件复制到public目录）
    const response = await fetch("/云星空BOM(最终完成版)(1).xlsx")
    if (!response.ok) {
      // 尝试其他可能的文件名
      const response2 = await fetch("/bom.xlsx")
      if (!response2.ok) {
        ElMessage.error("未找到BOM文件，请确保文件存在于public目录下")
        loading.value = false
        return
      }
      var arrayBuffer = await response2.arrayBuffer()
    } else {
      var arrayBuffer = await response.arrayBuffer()
    }

    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // 查找"半轴BOM2"sheet，如果不存在则使用第一个sheet
    let sheetName = "半轴BOM2"
    if (!workbook.SheetNames.includes(sheetName)) {
      sheetName = workbook.SheetNames[0]
    }

    const sheet = workbook.Sheets[sheetName]
    const bomData = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0 }) as any[][]

    // 创建BOM映射（父项物料型号 -> 产品编号、产品名称）
    const bomMap = new Map<string, { code: string; name: string }>()
    for (let i = 2; i < bomData.length; i++) {
      const row = bomData[i]
      if (row && row[2]) {
        let model = String(row[2]).trim()
        // 去掉结尾的 /p
        if (model.endsWith("/p")) {
          model = model.slice(0, -2)
        }
        if (!bomMap.has(model)) {
          bomMap.set(model, {
            code: row[0] || "",
            name: row[1] || ""
          })
        }
      }
    }

    // 匹配数据
    let matchedCount = 0
    let totalCount = 0
    allData.value.forEach(item => {
      totalCount++
      const shaftModel = item["半轴型号"]
      if (shaftModel) {
        const bomInfo = bomMap.get(shaftModel.trim())
        if (bomInfo) {
          item["产品编号"] = bomInfo.code
          item["产品名称"] = bomInfo.name
          matchedCount++
        }
      }
    })

    // 保存到本地
    saveToLocal()
    // 刷新表格
    handlePageChange()

    ElMessage.success(`匹配完成，共匹配 ${matchedCount} / ${totalCount} 条数据`)
  } catch (error) {
    console.error("匹配产品信息失败:", error)
    ElMessage.error("匹配产品信息失败")
  } finally {
    loading.value = false
  }
}

// 初始化加载（优先从本地）
const initData = () => {
  const localData = loadFromLocal()
  if (localData && localData.length > 0) {
    // 去重：删除完全相同的行
    const uniqueData = removeDuplicateRows(localData)
    allData.value = uniqueData
    // 保存原始数据，用于清除筛选后恢复
    originalData.value = [...uniqueData]
    pagination.value.total = allData.value.length
    // 保存去重后的数据到本地
    saveToLocal()
    handlePageChange()
  } else {
    loadData()
  }
}

// 删除完全重复的行（排除序号字段）
const removeDuplicateRows = (data: any[]): any[] => {
  // 排除序号字段后比较
  const excludeSeqNumber = (row: any) => {
    const { 序号, ...rest } = row
    return rest
  }

  // 先统计每行的出现次数（排除序号字段）
  const rowCount: Record<string, number> = {}
  for (const row of data) {
    const rowWithoutSeq = excludeSeqNumber(row)
    const rowStr = JSON.stringify(rowWithoutSeq)
    rowCount[rowStr] = (rowCount[rowStr] || 0) + 1
  }

  // 找出重复的行
  const duplicateRows = Object.entries(rowCount).filter(([_, count]) => count > 1)
  if (duplicateRows.length > 0) {
    console.log("发现完全相同的行:", duplicateRows.length, "种")
    duplicateRows.forEach(([rowStr, count]) => {
      console.log(`  出现${count}次:`, JSON.parse(rowStr))
    })
  } else {
    console.log("没有发现完全相同的行")
  }

  const seen = new Set<string>()
  const unique: any[] = []

  for (const row of data) {
    // 排除序号字段后转换为字符串作为唯一标识
    const rowWithoutSeq = excludeSeqNumber(row)
    const rowStr = JSON.stringify(rowWithoutSeq)
    if (!seen.has(rowStr)) {
      seen.add(rowStr)
      unique.push(row)
    }
  }

  return unique
}

// 分页变化
const handlePageChange = (currentPage?: number, pageSize?: number) => {
  // 如果传入了参数，更新 pagination 值
  if (currentPage) pagination.value.currentPage = currentPage
  if (pageSize) pagination.value.pageSize = pageSize

  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  tableData.value = allData.value.slice(start, end)
}

// 监听分页参数变化
watch(
  () => [pagination.value.currentPage, pagination.value.pageSize],
  () => {
    handlePageChange()
  }
)

// 导入
const handleImport = () => {
  importDialogVisible.value = true
  fileList.value = []
  selectedFile.value = null
}

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const confirmImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning("请选择要导入的文件")
    return
  }

  importLoading.value = true
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const importData = parseExcelData(workbook)

        if (importData.length === 0) {
          ElMessage.warning("文件中没有有效数据")
          return
        }

        // 去重：删除完全相同的行
        const uniqueData = removeDuplicateRows(importData)
        allData.value = uniqueData
        // 保存原始数据，用于清除筛选后恢复
        originalData.value = [...uniqueData]
        pagination.value.total = allData.value.length
        // 保存到本地
        saveToLocal()
        clearAllSearch()
        handlePageChange()
        importDialogVisible.value = false
        const removedCount = importData.length - uniqueData.length
        if (removedCount > 0) {
          ElMessage.success(`成功导入 ${uniqueData.length} 条数据（去除${removedCount}条重复）`)
        } else {
          ElMessage.success(`成功导入 ${uniqueData.length} 条数据`)
        }
      } catch (error) {
        ElMessage.error("解析Excel文件失败")
        console.error(error)
      } finally {
        importLoading.value = false
      }
    }
    reader.readAsBinaryString(selectedFile.value)
  } catch (error) {
    ElMessage.error("导入失败")
    console.error(error)
    importLoading.value = false
  }
}

// 导出
const handleExport = () => {
  if (allData.value.length === 0) {
    ElMessage.warning("没有数据可导出")
    return
  }

  const exportData = allData.value.map((row) => ({
    序号: row["序号"] || "",
    产品名称: row["产品名称"] || "",
    产品编号: row["产品编号"] || "",
    半轴型号: row["半轴型号"] || "",
    // 棒料编号: row["棒料编号"] || "", // Excel中无此列，已移除
    棒料规格直径: row["棒料规格直径"] || "",
    棒料规格尺寸: row["棒料规格尺寸"] || "",
    材料牌号: row["材料牌号"] || "",
    下料尺寸: row["下料尺寸"] || "",
    公差: row["公差"] || "",
    锯片厚度: row["锯片厚度"] || "",
    料头料尾切割厚度: row["料头料尾切割厚度"] || "",
    下料根数: row["下料根数"] || "",
    套料产品: row["套料产品"] || "",
    套料数量: row["套料数量"] || "",
    套料长度: row["套料长度"] || "",
    套料公差: row["套料公差"] || "",
    备注: row["备注"] || "",
    料头长度: row["料头长度"] || "",
    尾料长度: row["尾料长度"] || "",
    材料利用率: row["材料利用率"] || ""
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  worksheet["!cols"] = [
    { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 10 },
    { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "半轴下料卡")

  XLSX.writeFile(workbook, "半轴下料卡.xlsx")
  ElMessage.success("导出成功")
}

// 下载模板
const downloadTemplate = () => {
  const templateData = [
    {
      序号: 1, 产品名称: "", 产品编号: "", 半轴型号: "示例型号", 棒料规格直径: 36, 棒料规格尺寸: "示例尺寸",
      材料牌号: "40Cr", 下料尺寸: 1000, 公差: "(+2/0)", 锯片厚度: 3,
      料头料尾切割厚度: 60, 下料根数: 5, 套料产品: "", 套料数量: 0,
      套料长度: "", 套料公差: "", 备注: "", 料头长度: "", 尾料长度: "", 材料利用率: ""
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "半轴下料卡模板")

  worksheet["!cols"] = [
    { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 10 },
    { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }
  ]

  XLSX.writeFile(workbook, "半轴下料卡导入模板.xlsx")
  ElMessage.success("模板下载成功")
}

onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
.operation-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.low-util-rate-cell) {
  color: #f56c6c;
  font-weight: bold;
}

.layout-container {
  height: 100%;
}

.layout-main-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.custom-table-container {
  flex: 1;
  overflow: hidden;
}

.table-header-btn {
  display: flex;
  gap: 10px;
}

.import-content {
  padding: 20px;
}

.el-upload__tip {
  margin-top: 10px;
  color: #999;
}

.template-tip {
  margin-top: 15px;
  text-align: center;
}

.search-btns {
  margin-top: 8px;
  text-align: right;
}
</style>
