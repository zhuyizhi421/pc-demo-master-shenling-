<!--
生产运营管理 - 排班管理 - 排班计划
-->
<template>
  <div class="layout-container">
    <div class="layout-tree">
      <CustomTreeMenu
        ref="treeMenuRef"
        :menuItems="menuItems"
        nodeKey="entityId"
        label-attr="entityName"
        @nodeClick="treeNodeClick"
        :show-custom-icon="false"
      />
    </div>

    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle :title="`${currentAreaNode?.entityName}排班计划`">
          <div v-if="isAuth">
            <el-button
              @click="
                () => {
                  arrangeModelShow = true
                  getModelList()
                  // getClassesList()
                }
              "
              >设置排班模型</el-button
            >
            <el-button
              type="primary"
              icon="Plus"
              @click="
                () => {
                  resetNewArrangePlanModal()
                  setDefalutAreaIds()
                  createArrangePlanByModel = ''
                  newArrangePlanModal.show = true
                  getModelList()
                }
              "
              >新建计划</el-button
            >
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #operation-default="{ row }">
            <el-button link type="primary" @click="seePlanDetail(row)" size="small">
              查看详情
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <!-- 点击 设置排班模型 -->
    <CustomDialog draggable title="排班模型" v-model="arrangeModelShow" size="mdeium">
      <CustomTitle title="排班模型" :is-table-title="false">
        <el-button
          type="primary"
          icon="Plus"
          @click="
            () => {
              newArrangeModel = newArrangeModelInit()
              newArrangeModel.show = true
            }
          "
          >新建模型</el-button
        >
      </CustomTitle>
      <CustomTable
        v-model:table-data="arrangeModelData"
        :config="arrangeModelTableConfig"
        class="custom-table"
      >
        <template #action-default="{ row }">
          <el-button link type="primary" size="small" @click="editModelRow(row)">
            编辑查看
          </el-button>
          <el-button link type="danger" size="small" @click="deleteModelRow(row)"> 删除 </el-button>
        </template>
      </CustomTable>
      <template #footer>
        <el-button @click="arrangeModelShow = false">返回</el-button>
      </template>
    </CustomDialog>

    <!-- 新建/查看 排班模型 -->
    <CustomDialog
      v-model="newArrangeModel.show"
      :title="`${newArrangeModel.id ? '编辑' : '新建'}排班模型`"
      size="medium"
    >
      <CustomForm
        ref="newArrangeFormRef"
        :configs="newArrangeModelFormConfig"
        v-model="newArrangeModel"
        :columns="1"
        :label-width="100"
      />
      <CustomTitle title="排班规则">
        <el-button type="primary" icon="Plus" @click="addArrange">新增排班</el-button>
      </CustomTitle>
      <CustomTable
        v-model:table-data="newArrangeModel.ruleList"
        :config="newArrangeModelTableConfig"
      >
        <template #cycleType-default="{ row }">
          <el-select v-model="row.cycleType">
            <el-option label="按天" :value="1" />
            <el-option label="按周" :value="2" />
          </el-select>
        </template>
        <template #weeklyRule-default="{ row }">
          <el-select v-if="row.cycleType === 2" v-model="row.weeklyRule" multiple collapse-tags>
            <el-option
              v-for="(item, index) in ['一', '二', '三', '四', '五', '六', '日']"
              :key="item"
              :label="`周${item}`"
              :value="index + 1"
            />
          </el-select>
          <span v-else>-</span>
        </template>
        <template #rotationId-default="{ row }">
          <el-select v-model="row.rotationId" filterable placeholder="请选择">
            <el-option
              v-for="item in classesData"
              :key="item.id"
              :label="item.rotationName"
              :value="item.id"
            />
          </el-select>
        </template>
        <template #shiftTime-default="{ row }">
          {{ getShiftTime(row) }}
        </template>
        <template #action-default="scope">
          <el-button
            link
            type="danger"
            @click="
              () => {
                newArrangeModel.ruleList.splice(scope.$index, 1)
              }
            "
          >
            删除
          </el-button>
        </template>
      </CustomTable>

      <template #footer>
        <el-button @click="newArrangeModel.show = false">取消</el-button>
        <el-button type="primary" @click="newArrangeModelOk"> 保存 </el-button>
      </template>
    </CustomDialog>

    <!-- 新建/查看 排班计划 -->
    <CustomDialog
      draggable
      v-model="newArrangePlanModal.show"
      @close="resetNewArrangePlanModal()"
      :title="`${!!newArrangePlanModal.id ? '查看' : '新建'}排班计划`"
      width="1200"
    >
      <CustomForm
        ref="newArrangePlanFormRef"
        :configs="newArrangePlanModalFormConfig"
        v-model="newArrangePlanModal"
        :columns="1"
        :label-width="100"
      />

      <CustomTitle title="排班创建" :is-table-title="false">
        <div>
          <el-select
            :disabled="!!newArrangePlanModal.id"
            clearable
            @change="changeModel"
            v-model="createArrangePlanByModel"
            placeholder="按排班模型"
            class="mr-[12px]"
            style="width: 150px"
          >
            <el-option
              v-for="item in arrangeModelData"
              :key="item.id"
              :label="item.modelName"
              :value="item.id"
            />
          </el-select>
          <el-button
            :disabled="!!newArrangePlanModal.id"
            type="primary"
            icon="Plus"
            @click="addArrangeInPlan"
            >新增排班</el-button
          >
        </div>
      </CustomTitle>
      <CustomTable
        v-model:table-data="newArrangePlanModal.detailList"
        :config="newArrangePlanModalTableConfig"
      >
        <template #cycleType-default="{ row }">
          <el-select :disabled="!!newArrangePlanModal.id" v-model="row.cycleType">
            <el-option label="按天" :value="1" />
            <el-option label="按周" :value="2" />
          </el-select>
        </template>
        <template #weeklyRule-default="{ row }">
          <el-select
            :disabled="!!newArrangePlanModal.id"
            v-if="row.cycleType === 2"
            v-model="row.weeklyRule"
            multiple
            collapse-tags
          >
            <el-option
              v-for="(item, index) in ['一', '二', '三', '四', '五', '六', '日']"
              :key="item"
              :label="`周${item}`"
              :value="index + 1"
            />
          </el-select>
          <span v-else>-</span>
        </template>
        <template #rotationId-default="{ row }">
          <el-select
            v-model="row.rotationId"
            filterable
            placeholder="请选择"
            :disabled="!!newArrangePlanModal.id"
          >
            <el-option
              v-for="item in classesData"
              :key="item.id"
              :label="item.rotationName"
              :value="item.id"
            />
          </el-select>
        </template>
        <template #shiftTime-default="{ row }">
          {{ getShiftTime(row, 1) }}
        </template>
        <template #teamId-default="{ row }">
          <el-select
            v-model="row.teamId"
            placeholder="请选择"
            filterable
            :disabled="!!newArrangePlanModal.id"
            @change="onChangeShiftGroup($event, row)"
          >
            <el-option
              v-for="item in teamGroupData"
              :key="item.id"
              :label="item.teamName"
              :value="item.id"
            />
          </el-select>
        </template>
        <template #leaderList-default="{ row }">
          {{ row.teamOriginData?.leaderList?.map((item: any) => item.name).join(",") ?? "-" }}
        </template>
        <template #memberNumber-default="{ row }">
          {{ row.teamOriginData?.memberNumber ?? "" }}
        </template>
        <template #action-default="scope">
          <el-button
            link
            type="danger"
            :disabled="!!newArrangePlanModal.id"
            @click="
              () => {
                newArrangePlanModal.detailList.splice(scope.$index, 1)
              }
            "
            >删除</el-button
          >
        </template>
      </CustomTable>

      <template #footer>
        <el-button @click="resetNewArrangePlanModal()">取消</el-button>
        <el-button v-if="!newArrangePlanModal.id" type="primary" @click="createArrangePlanOk">
          保存
        </el-button>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { queryModelTreeByLeafType } from "@/api/fm"
import {
  createScheduleModelItem,
  createSchedulePlanItem,
  deleteScheduleModelItem,
  getEnabledClassesList,
  getEnabledTeamGroupList,
  getScheduleModelList,
  getScheduleModelRule,
  getSchedulePlanPaged,
  getSchedulePlanRecord,
  updateScheduleModelItem
} from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import CustomTreeMenu from "@/components/CustomTreeMenu/index.vue"
import SelectFactoryModel from "@/components/SelectFactoryModel/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IFactoryModelTreeNode } from "@/types/base-info/factory-model"
import type {
  ISchedulePlanPageItem as ITableRow,
  ISchedulePlanPageParams
} from "@/types/production-manage/scheduling"

defineOptions({
  name: "ProduceArrangePlan"
})

const isAuth = useButtonAuth("ProduceArrangePlan_update", "ProduceArrangePlan_query")

const menuItems = ref<Partial<IFactoryModelTreeNode>[]>([])
const currentAreaNode = ref<IFactoryModelTreeNode>()
const arrangeModelShow = ref(false)
const arrangeModelData = ref<any[]>([{}])
const classesData = ref<any[]>([])
const newArrangeModelInit = () => {
  return {
    show: false,
    modelName: "",
    remark: "",
    id: "",
    modelCode: "",
    ruleList: [
      {
        id: "",
        cycleType: 2, // 1按天 2按周
        rotationId: "",
        weeklyRule: [1] // 周列表:数字代表周几
      }
    ]
  }
}
const newArrangeModel = ref(newArrangeModelInit()) //排班模型数据
const newArrangeFormRef = ref<InstanceType<typeof CustomForm>>() //排班模型form表

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "schedulingName",
    label: "计划名称",
    value: "",
    placeholder: "请输入计划名称"
  },
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "date",
    label: "日期",
    value: [],
    placeholder: ["请选择开始日期", "请选择结束日期"],
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    keyword: ["startDate", "endDate"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  schedulingName?: string
  startDate?: string
  endDate?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const treeMenuRef = ref<InstanceType<typeof CustomTreeMenu>>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "schedulingCode",
      label: "计划编号",
      minWidth: 160
    },
    {
      prop: "schedulingName",
      label: "计划名称",
      minWidth: 160
    },
    {
      prop: "date",
      label: "日期",
      minWidth: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return `${row.startDate} ~ ${row.endDate}`
      }
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

/** 点击设置排班模型表格配置 */
const arrangeModelTableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: 400,
  columns: [
    {
      prop: "modelCode",
      label: "模型编号",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "modelName",
      label: "模型名称",
      width: 160,
      showOverflowTooltip: true
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: "action",
      label: "操作",
      width: 130,
      fixed: "right",
      showOverflowTooltip: true,
      slots: {
        default: "action-default"
      }
    }
  ]
}))

/** 新建/查看排班模型表单配置 */
const newArrangeModelFormConfig = computed<ICustomFormConfigItem[]>(() => {
  return [
    {
      componentType: "el-input",
      field: "modelName",
      label: "模型名称",
      rules: [
        {
          required: true,
          message: "请输入模型名称",
          trigger: "change"
        }
      ],
      props: {
        placeholder: "请输入模型名称"
      }
    },
    {
      componentType: "el-input",
      field: "modelCode",
      label: "模型编码",
      colspan: -1,
      hidden: !newArrangeModel.value.id,
      props: {
        placeholder: "请输入模型编码",
        disabled: true
      }
    },
    {
      componentType: "el-input",
      field: "remark",
      label: "备注",
      props: {
        type: "textarea",
        placeholder: "请输入备注",
        maxlength: 200,
        showWordLimit: true
      }
    }
  ]
})
/** 新建/查看排班计划表格配置 */
const newArrangeModelTableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: 300,
  columns: [
    {
      prop: "cycleType",
      label: "排班方式",
      width: 160,
      align: "center",
      slots: {
        default: "cycleType-default"
      }
    },
    {
      prop: "weeklyRule",
      label: "每周",
      width: 180,
      align: "center",
      slots: {
        default: "weeklyRule-default"
      }
    },
    {
      prop: "rotationId",
      label: "班次",
      width: 160,
      align: "center",
      slots: {
        default: "rotationId-default"
      }
    },
    {
      prop: "shiftTime",
      label: "班次时间",
      minWidth: 100,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "shiftTime-default"
      }
    },
    {
      prop: "action",
      label: "操作",
      width: 60,
      fixed: "right",
      slots: {
        default: "action-default"
      }
    }
  ]
}))

/** 新建/查看 排班计划表单配置 */
const newArrangePlanModalFormConfig = computed<ICustomFormConfigItem[]>(() => {
  return [
    {
      componentType: "el-input",
      field: "schedulingName",
      label: "计划名称",
      rules: [
        {
          required: true,
          message: "请输入计划名称",
          trigger: "change"
        }
      ],
      props: {
        placeholder: "请输入",
        disabled: !!newArrangePlanModal.value.id
      }
    },
    {
      label: "生产单位",
      componentType: SelectFactoryModel,
      field: "productionUnitIdList",
      rules: [
        {
          required: true,
          trigger: "blur",
          validator: (rule: any, value: any, callback: Function) => {
            console.log("validator", [...value])
            if (!value.length) return callback("请选择生产单位")
            callback()
          }
        }
      ],
      props: {
        class: "w-[100%]",
        type: SelectType.ProductType,
        disabled: !!newArrangePlanModal.value.id,
        multiple: true,
        valueAttr: "entityId"
      }
    },
    {
      label: "日期",
      field: "time",
      componentType: "el-date-picker",
      rules: [
        {
          required: true,
          message: "请选择日期",
          trigger: "change"
        }
      ],
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        disabled: !!newArrangePlanModal.value.id,
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期",
        format: "YYYY-MM-DD",
        disabledDate: disabledDate
      }
    },
    {
      label: "备注",
      componentType: "el-input",
      field: "remark",
      props: {
        type: "textarea",
        placeholder: "请输入",
        disabled: !!newArrangePlanModal.value.id,
        maxlength: 200,
        showWordLimit: true
      }
    }
  ]
})
/** 新建/查看 排班计划表格配置 */
const newArrangePlanModalTableConfig = computed<ITableConfig>(() => ({
  stripe: true,
  height: 300,
  columns: [
    {
      prop: "cycleType",
      label: "排班方式",
      width: 120,
      align: "center",
      slots: {
        default: "cycleType-default"
      }
    },
    {
      prop: "weeklyRule",
      label: "每周",
      width: 180,
      align: "center",
      slots: {
        default: "weeklyRule-default"
      }
    },
    {
      prop: "rotationId",
      label: "班次",
      width: 160,
      align: "center",
      slots: {
        default: "rotationId-default"
      }
    },
    {
      prop: "shiftTime",
      label: "班次时间",
      align: "center",
      minWidth: 100,
      showOverflowTooltip: true,
      slots: {
        default: "shiftTime-default"
      }
    },
    {
      prop: "teamId",
      label: "班组",
      width: 160,
      align: "center",
      slots: {
        default: "teamId-default"
      }
    },
    {
      prop: "leaderList",
      label: "班组长",
      width: 120,
      align: "center",
      showOverflowTooltip: true,
      slots: {
        default: "leaderList-default"
      }
    },
    {
      prop: "memberNumber",
      label: "班组人数",
      width: 120,
      align: "right",
      showOverflowTooltip: true,
      slots: {
        default: "memberNumber-default"
      }
    },
    {
      prop: "action",
      label: "操作",
      width: 70,
      fixed: "right",
      showOverflowTooltip: true,
      slots: {
        default: "action-default"
      }
    }
  ]
}))

onMounted(() => {
  getTreeMenuData()
  getClassesList()
  getTeamGroupList()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

// 获取节点下的所有生产单位ID
const getProductionUnitIds = (node: IFactoryModelTreeNode): string[] => {
  if (!node) return []
  // 如果是生产单位，直接返回自身ID
  if (node.levelTag === "productionUnit") {
    return [node.entityId]
  }
  // 如果是工厂或区域，递归获取所有子生产单位
  const ids: string[] = []
  const collectProductionUnits = (n: any) => {
    if (n.levelTag === "productionUnit") {
      ids.push(n.entityId)
    }
    if (n.children && n.children.length > 0) {
      n.children.forEach(collectProductionUnits)
    }
  }
  collectProductionUnits(node)
  return ids
}

const queryConfig: ITableRequestConfig<[ISchedulePlanPageParams], ITableRow, true> = {
  api: getSchedulePlanPaged,
  getParams: () => {
    return [
      {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize,
        productionUnitIdList: getProductionUnitIds(currentAreaNode.value!),
        ...getFormData()
      }
    ]
  }
}

/** 获取班次时间 */
const getShiftTime = (row?: any, flag?: number) => {
  if (!row.rotationId) {
    return ""
  }

  const time = classesData.value.find((item: any) => item.id === row.rotationId)?.rotationTime ?? ""

  if (flag) {
    return time || (row.startTime && row.endTime ? "" + row.startTime + "至" + row.endTime : "")
  }
  return time
}

// 新建排班模型中的排班
const addArrange = () => {
  newArrangeModel.value.ruleList.push(newArrangeModelInit().ruleList[0])
  // 点击新增排班的时候，怎么个逻辑，还要和产品确认
}

// 发布计划中的新增排班
const addArrangeInPlan = () => {
  newArrangePlanModal.value.detailList.push(cloneDeep(teamGroupDetailItem))
}

const treeNodeClick = (data: IFactoryModelTreeNode) => {
  currentAreaNode.value = data
  onReset()
}

// 获取区域树列表
const getTreeMenuData = async () => {
  try {
    const res = await queryModelTreeByLeafType({
      leafType: 1,
      isEnable: true
    })
    // 只显示工厂、区域和生产单位
    const allowedTypes = ["factory", "productionArea", "productionUnit"]
    const filterTree = (nodes: any[]): any[] => {
      return nodes
        .filter((node) => allowedTypes.includes(node.levelTag))
        .map((node) => ({
          ...node,
          children: node.children ? filterTree(node.children) : []
        }))
    }
    const filteredRes = filterTree(res || [])
    menuItems.value = filteredRes
    // 这里需要默认选中第一项
    setTimeout(() => {
      const originRef = treeMenuRef.value
      if (originRef && filteredRes.length) {
        originRef.setCurrentKey(filteredRes[0].entityId)
        treeNodeClick(filteredRes[0])
      }
    }, 50)
  } catch (error) {
    console.log("getTreeMenuData", error)
  }
}

const setDefalutAreaIds = () => {
  newArrangePlanModal.value.productionUnitIdList = currentAreaNode.value && [currentAreaNode.value.entityId]
}

// 获取排班模型列表
const getModelList = async () => {
  try {
    const res = await getScheduleModelList()
    arrangeModelData.value = res
  } catch (error) {
    /* empty */
  }
}

// 获取启用班次列表
const getClassesList = async () => {
  try {
    const res = await getEnabledClassesList()
    classesData.value = res
  } catch (error) {
    /* empty */
  }
}
//排班模型 保存
const newArrangeModelOk = async () => {
  await newArrangeFormRef.value?.validateForm()
  try {
    const params = {
      modelName: newArrangeModel.value.modelName,
      remark: newArrangeModel.value.remark,
      ruleList: newArrangeModel.value.ruleList.map((item: any) => {
        return {
          cycleType: item.cycleType,
          rotationId: item.rotationId,
          id: item.id,
          weeklyRule: item.weeklyRule
        }
      })
    }
    if (newArrangeModel.value?.id) {
      await updateScheduleModelItem(newArrangeModel.value.id, params)
      ElMessage.success("编辑成功")
    } else {
      await createScheduleModelItem(params)
      ElMessage.success("新建成功")
    }
    getModelList()
    newArrangeModel.value = newArrangeModelInit()
  } catch (error) {
    /* empty */
  }
}

const deleteModelRow = async (data: any) => {
  try {
    await ElMessageBox.confirm("确定删除该排班模型么？", "提示", {
      type: "warning"
    })
    await deleteScheduleModelItem(data.id)
    ElMessage.success("删除成功")
    getModelList()
  } catch (error) {
    /* empty */
  }
}

const editModelRow = async (data: any) => {
  try {
    const res = await getScheduleModelRule(data.id)
    const rulesList = res.map((item: any) => {
      return {
        id: item.id,
        cycleType: item.cycleType,
        rotationId: item.rotationId,
        weeklyRule: item.weeklyRule
      }
    })

    newArrangeModel.value = {
      show: true,
      modelName: data.modelName,
      remark: data.remark,
      id: data.id,
      modelCode: data.modelCode,
      ruleList: []
    }

    newArrangeModel.value.ruleList = rulesList
  } catch (error) {
    /* empty */
  }
}

// #region 排班计划
const teamGroupData = ref<any[]>([])
const teamGroupDetailItem = {
  cycleType: 2, // 1按天 2按周
  rotationId: "",
  teamId: "",
  teamOriginData: {},
  weeklyRule: [1] // 周列表:数字代表周几
} as const
const [newArrangePlanModal, resetNewArrangePlanModal] = useResetRef<any>({
  show: false,

  id: "",
  remark: "",
  time: [],
  schedulingName: "",
  productionUnitIdList: [],
  detailList: [cloneDeep(teamGroupDetailItem)]
})
const newArrangePlanFormRef = ref<InstanceType<typeof CustomForm>>()

// 获取排班组 列表
const getTeamGroupList = async () => {
  try {
    const res = await getEnabledTeamGroupList()
    console.log("getEnabledTeamGroupList", res)
    teamGroupData.value = res
  } catch (error) {
    /* empty */
  }
}

/** 改变班组下拉 */
const onChangeShiftGroup = (val: string, row: any) => {
  row.teamOriginData = teamGroupData.value.find((item) => item.id === val)
}

// 创建排班计划时，按照模型创建排班
const createArrangePlanByModel = ref()
const changeModel = async (id: any) => {
  try {
    if (!id) return
    const res = await getScheduleModelRule(id)
    const detailList = res.map((item: any) => {
      return {
        id: item.id,
        cycleType: item.cycleType,
        rotationId: item.rotationId,
        weeklyRule: item.weeklyRule,
        teamId: "",
        teamOriginData: {}
      }
    })
    newArrangePlanModal.value.detailList = detailList
  } catch (error) {
    /* empty */
  }
}

const createArrangePlanOk = async () => {
  try {
    const valid = await newArrangePlanFormRef.value?.validateForm()
    if (!valid) return
    const { remark, time, schedulingName, productionUnitIdList, detailList } = newArrangePlanModal.value
    let errorText = ""
    const params = {
      schedulingName,
      remark,
      productionUnitIdList,
      detailList: detailList.map((item: any) => {
        if (!errorText && item.cycleType === 2 && !item.weeklyRule.length) errorText = "请选择每周"
        return {
          cycleType: item.cycleType,
          rotationId: item.rotationId,
          id: item.id,
          weeklyRule: item.weeklyRule,
          teamId: item.teamId
        }
      }),
      endDate: dayjs(time[1]).format("YYYY-MM-DD"),
      startDate: dayjs(time[0]).format("YYYY-MM-DD")
    }
    if (errorText) {
      ElMessage.error(errorText)
      return
    }
    await ElMessageBox.confirm("发布后无法修改，确定发布？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "返回"
    })
    await createSchedulePlanItem(params)
    customTableRef.value?.requestData()
    ElMessage.success("新建成功")
    resetNewArrangePlanModal()
  } catch (error) {
    /* empty */
  }
}

const seePlanDetail = (data: any) => {
  newArrangePlanModal.value = {
    show: true,
    id: data.id,
    remark: data.remark,
    time: data.startDate && data.endDate ? [data.startDate, data.endDate] : [],
    schedulingName: data.schedulingName,
    productionUnitIdList: data.productionUnitId ? [data.productionUnitId] : [],
    detailList: []
  }
  getSchedulePlanRecord(data.id)
    .then((res) => {
      console.log("getSchedulePlanRecord", res)
      newArrangePlanModal.value.detailList = res.map((item) => {
        return {
          cycleType: item.cycleType,
          rotationId: item.rotationId,
          teamId: item.teamId,
          weeklyRule: item.weeklyRule ?? [],
          teamOriginData: {
            memberNumber: item.memberNumber,
            leaderList: item.leaderList
          },
          startTime: item.startTime,
          endTime: item.endTime
        }
      })
    })
    .catch(() => {})
}
const disabledDate = (time: Date) => {
  // const upTimeStamp = dayjs().day(32).valueOf()
  // const yesterdayStamp = dayjs().day(-1).valueOf()
  // return time.getTime() < yesterdayStamp || time.getTime() > upTimeStamp

  const today = new Date()

  // 计算昨天的日期
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 2)

  // 计算今天后 31 天的日期
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + 31)

  // 判断是否在昨天到今天后31天范围内
  return time < yesterday || time > futureDate
}
// #endregion
</script>

<style scoped lang="scss">
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 292px;
    height: 100%;
    padding: 14px 8px 0 8px;
    border-right: 1px solid #e8e8e8;
    overflow-y: auto;
  }
  .layout-main-page {
    flex: 1;
    overflow: hidden;
  }
}

.dialog-content-title {
  margin-top: 4px;
}
</style>
