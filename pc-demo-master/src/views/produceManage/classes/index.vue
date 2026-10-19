<!--
生产运营管理 - 排班管理 - 班次管理
--->
<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <div class="custom-table-container">
        <CustomTitle title="班次管理">
          <div v-if="isAuth">
            <el-button
              icon="Plus"
              type="primary"
              @click="
                () => {
                  resetUpdateForm()
                  updateForm.show = true
                }
              "
            >
              新建班次
            </el-button>
          </div>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #rotationStatus-default="{ row }">
            <el-tag link :type="row.rotationStatus === 1 ? 'success' : 'danger'">{{
              row.rotationStatus === 1 ? "启用" : "停用"
            }}</el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="editSeeRow(row.rotationStatus === 1, row)"
            >
              {{ row.rotationStatus === 1 ? "查看详情" : "编辑查看" }}
            </el-button>
            <el-button
              link
              @click="onAbleRow(row)"
              v-if="isAuth"
              :type="row.rotationStatus === 1 ? 'danger' : 'primary'"
              size="small"
              >{{ row.rotationStatus === 1 ? "停用" : "启用" }}</el-button
            >
            <el-button
              v-if="row.rotationStatus !== 1 && isAuth"
              link
              type="danger"
              size="small"
              @click="deleteRow(row)"
              >删除</el-button
            >
          </template>
        </CustomTable>
      </div>
    </div>

    <!-- 新建班次弹框 -->
    <CustomDialog
      :title="!isAuth ? '查看班次' : updateForm.id ? '编辑查看' : '新建班次'"
      v-model="updateForm.show"
      draggable
    >
      <CustomForm
        :configs="formConfigs"
        v-model="updateForm"
        ref="updateFormRef"
        :label-width="100"
      >
        <template #time-default>
          <el-form-item
            label="班次时间"
            prop="time"
            :rules="[
              {
                required: true,
                trigger: 'blur',
                len: 2,
                validator: (rule: any, value: any, callback: Function) => {
                  if (value.length < 2 || !value[0] || !value[1]) return callback('请选择班次时间')
                  callback()
                }
              }
            ]"
          >
            <el-time-picker
              v-model="updateForm.time[0]"
              placeholder="开始时间"
              format="HH:mm"
              value-format="HH:mm"
              :disabled="updateForm.justSee || !isAuth"
              style="width: 173px"
            ></el-time-picker>
            <div class="mx-[8px]">-</div>
            <el-time-picker
              v-model="updateForm.time[1]"
              placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
              :disabled="updateForm.justSee || !isAuth"
              style="width: 173px"
            ></el-time-picker>
            <div v-if="showGapDay" class="ml-[8px]">跨天</div>
          </el-form-item>
        </template>
      </CustomForm>
      <CustomTitle title="计划停机时段">
        <el-button
          v-if="!updateForm.justSee"
          :disabled="updateForm.justSee || !isAuth"
          icon="Plus"
          type="primary"
          @click="updateAddPeriod"
        >
          添加时段
        </el-button>
      </CustomTitle>
      <CustomTable :config="stopPeriodTableConfig" v-model:table-data="updateForm.stopPeriodList">
        <template #index-default="scope">
          {{ scope.$index + 1 }}
        </template>
        <template #date-default="{ row }">
          <div class="flex items-center">
            <el-time-picker
              :disabled="updateForm.justSee || !isAuth"
              v-model="row.startTime"
              placeholder="开始时间"
              format="HH:mm"
              value-format="HH:mm"
            />
            <div class="mx-[8px]">-</div>
            <el-time-picker
              :disabled="updateForm.justSee || !isAuth"
              v-model="row.endTime"
              placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
            />
          </div>
        </template>
        <template #operation-default="scope">
          <el-button link type="danger" size="small" @click="deleteUpdateRow(scope.$index)"
            >删除</el-button
          >
        </template>
      </CustomTable>

      <template #footer>
        <el-button @click="resetUpdateForm">取 消</el-button>
        <el-button type="primary" v-if="!updateForm.justSee && isAuth" @click="updateOk"
          >保 存</el-button
        >
      </template>
    </CustomDialog>
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  createClasses,
  deleteClasses,
  disabledClasses,
  enableClasses,
  getClassesList,
  getClassesStopPeriod,
  updateClasses
} from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useButtonAuth from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"
import type { IClassesItem as ITableRow } from "@/types/production-manage/scheduling"

defineOptions({
  name: "ProduceArrangeClasses"
})

const isAuth = useButtonAuth("ProduceArrangeClasses_update", "ProduceArrangeClasses_query")

// 班次管理
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "rotationCode",
      label: "班次编号",
      minWidth: 160,
      formatter: (row: ITableRow & { rotation_code?: string }) =>
        row.rotationCode ?? row.rotation_code ?? ""
    },
    {
      prop: "rotationName",
      label: "班次名称",
      minWidth: 160
    },
    {
      prop: "rotationStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "rotationStatus-default"
      }
    },
    {
      prop: "rotationTime",
      label: "时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 170,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const updateFormRef = ref<InstanceType<typeof CustomForm>>()
const [updateForm, resetUpdateForm] = useResetRef<any>({
  id: "",
  show: false,
  time: [],
  justSee: false,
  rotationCode: "",
  beforeMinute: "",
  remark: "",
  rotationName: "",
  stopPeriodList: []
})
const showGapDay = ref(false)

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "班次名称",
    field: "rotationName",
    componentType: "el-input",
    rules: [
      {
        required: true,
        message: "请输入班次名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入",
      disabled: updateForm.value.justSee || !isAuth.value
    }
  },
  {
    label: "班次编号",
    field: "rotationCode",
    componentType: "el-input",
    props: {
      placeholder: "不填则自动生成",
      disabled: updateForm.value.justSee || !isAuth.value || !!updateForm.value.id
    }
  },
  {
    componentType: "div",
    special: true,
    field: "time",
    slots: {
      default: "time-default"
    }
  },
  {
    label: "备注",
    field: "remark",
    componentType: "el-input",
    props: {
      disabled: updateForm.value.justSee || !isAuth.value,
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  }
])
// 弹窗内表格
const stopPeriodTableConfig = ref<ITableConfig>({
  height: 200,
  stripe: true,
  columns: [
    {
      prop: "index",
      label: "序号",
      width: 60,
      showOverflowTooltip: true,
      slots: {
        default: "index-default"
      }
    },
    {
      prop: "date",
      label: "时段",
      align: "center",
      slots: {
        default: "date-default"
      }
    },
    {
      prop: "operation",
      hidden: !(!updateForm.value.justSee && isAuth.value),
      label: "操作",
      width: 60,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
onMounted(() => {
  customTableRef.value?.requestData()
})

watch(
  () => [updateForm.value.show, JSON.stringify(updateForm.value.time)],
  ([val, time]) => {
    if (val) {
      const [startTime, endTime] = JSON.parse(time)
      if (startTime && endTime) {
        const diff = dayjs(endTime, "HH:mm").diff(dayjs(startTime, "HH:mm"), "minute")

        if (diff <= 0) {
          showGapDay.value = true
        } else {
          showGapDay.value = false
        }
      } else {
        showGapDay.value = false
      }
    }
  }
)

const queryConfig: ITableRequestConfig<[], ITableRow, false> = {
  api: getClassesList
}

// 删除班次
const deleteRow = async (data: any) => {
  await ElMessageBox.confirm("此操作将永久删除该班次, 是否继续?", "提示", {
    type: "warning"
  })
  await deleteClasses(data.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

// 编辑班次
const editSeeRow = async (justSee: boolean, data: any) => {
  const res = await getClassesStopPeriod(data.id)
  const stopPeriodList = res.map((item: any) => {
    return {
      startTime: item.startTime,
      endTime: item.endTime,
      id: item.id
    }
  })

  updateForm.value = {
    show: true,
    justSee,
    ...data,
    stopPeriodList: stopPeriodList,
    time: [data.startTime, data.endTime]
  }
}

// 停用班次
const onAbleRow = async (data: any) => {
  await ElMessageBox.confirm(
    `确定${data.rotationStatus === 1 ? "停用" : "启用"}该班次吗？`,
    "提示",
    {
      type: "warning"
    }
  )
  if (data.rotationStatus === 1) {
    await disabledClasses(data.id)
    ElMessage.success("停用成功")
  } else {
    await enableClasses(data.id)
    ElMessage.success("启用成功")
  }
  customTableRef.value?.requestData()
}

const updateAddPeriod = () => {
  updateForm.value.stopPeriodList.push({
    startTime: "",
    id: "",
    endTime: ""
  })
}

const deleteUpdateRow = (index: number) => {
  updateForm.value.stopPeriodList.splice(index, 1)
}

const updateOk = async () => {
  const validate = await updateFormRef.value?.validateForm()
  if (!validate) return

  const { time } = updateForm.value
  const startTime = time[0]
  const endTime = time[1]
  const stopPeriodList = updateForm.value.stopPeriodList.map((item: any) => {
    return {
      startTime: item.startTime,
      id: item.id,
      endTime: item.endTime
    }
  })

  const hasEmpty = stopPeriodList.some((item: any) => !item.startTime || !item.endTime)
  if (hasEmpty) {
    ElMessage.warning("请补充停机时段信息")
    return
  }

  if (updateForm.value.id) {
    await updateClasses(updateForm.value.id, {
      ...updateForm.value,
      startTime,
      endTime,
      stopPeriodList
    })
    ElMessage.success("编辑成功")
  } else {
    await createClasses({
      ...updateForm.value,
      startTime,
      endTime,
      stopPeriodList
    })
    ElMessage.success("新建成功")
  }

  customTableRef.value?.requestData()
  resetUpdateForm()
}
</script>
<style scoped lang="scss"></style>
