<template>
  <!-- 示例1：单节点-自定义组件的配置（分页器示例） -->
  <CustomRecursion :config="paginationConfig" />

  <!-- 示例2：多节点嵌套-自定义组件的配置（v-model,slots,events） -->
  <CustomRecursion :config="multiNodeConfig">
    <!-- 匹配对应的插槽 -->
    <template #firstDivInput1-prefix> prefix1 </template>
    <template #firstDivInput2-prefix="{ data }"> {{ data.prefixValue }} </template>
    <template #secondDivInput1-prefix> prefix1 </template>
    <template #secondDivInput2-prefix="{ data }"> {{ data.prefixValue }} </template>
    <template #thirdDivInput-prefix="{ data }"> {{ data.prefixValue }} </template>
    <!-- 使用插槽形式渲染子组件 -->
    <template #secondDivSelect-default="{ data }">
      <el-option
        v-for="(item, index) in data.options"
        :key="index"
        :label="item.props.label"
        :value="item.props.value"
      ></el-option>
    </template>
  </CustomRecursion>

  <!-- 示例3，使用computed返回的配置, 测试响应式 -->
  <CustomRecursion :config="multiComputedNodeConfig" />
</template>

<script setup lang="ts">
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomRecursion from "@/components/CustomRecursion/index.vue"
import type { ICustomRecursionConfig } from "@/components/CustomRecursion/type"

// 单节点-自定义组件的配置（分页器示例）
// 等价于
// <CustomPagination
//   v-model:currentPage="pagination.currentPage"
//   v-model:pageSize="pagination.pageSize"
//   :total="pagination.total"
//   :border="false"
//   @change="tableRef?.requestData()"
// />
const pagination = reactive({ currentPage: 1, pageSize: 20, total: 100 })
const paginationConfig = computed<ICustomRecursionConfig>(() => ({
  componentType: CustomPagination,
  props: {
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    total: pagination.total,
    border: true
  },
  events: {
    "update:currentPage": (value: number) => {
      console.log("update:currentPage::触发")
      pagination.currentPage = value
    },
    "update:pageSize": (value: number) => {
      console.log("update:pageSize::触发")
      pagination.pageSize = value
    },
    change: () => {
      console.log("change::触发刷新")
    }
  }
}))

/**
 * 多节点嵌套-自定义组件的配置（v-model，slots,events）
 *
 */
const firstDivInputVModel1 = ref("")
const firstDivInputVModel2 = ref("")
const secondDivInputVModel1 = ref("")
const secondDivInputVModel2 = ref("")
const thirdDivInputVModel = ref("") // 第三级-多层级嵌套且传递插槽等
// 渲染下拉子组件的两种方式
const secondDivSelectVModel = ref("2")
const optionsNumber = ref(2)
// 测试响应式
const secondDivSelectOptions = computed(() => {
  const options = []
  for (let i = 0; i < optionsNumber.value; i++) {
    options.push({
      componentType: "el-option",
      props: {
        label: `选项${i + 1}`,
        value: `${i + 1}`
      }
    })
  }
  return options
})
const multiNodeConfig = ref<ICustomRecursionConfig[]>([
  {
    componentType: "div",
    props: {
      class: "mt-[12px]",
      customChildren: [
        {
          componentType: "div",
          content: "测试content",
          props: {}
        },
        {
          componentType: "el-input",
          props: {
            modelValue: firstDivInputVModel1,
            placeholder: "请输入firstDivInputVModel-1"
          },
          slots: {
            prefix: "firstDivInput1-prefix"
          }
        },

        {
          componentType: "el-input",
          props: {
            modelValue: firstDivInputVModel2,
            placeholder: "请输入firstDivInputVModel-2",
            prefixValue: "prefix2"
          },
          slots: {
            prefix: "firstDivInput2-prefix"
          }
        },
        // 第三级-多层级嵌套且传递插槽等
        {
          componentType: "div",
          props: {
            customChildren: [
              {
                componentType: "el-input",
                props: {
                  modelValue: thirdDivInputVModel,
                  prefixValue: "prefix3",
                  placeholder: "请输入thirdDivInputVModel"
                },
                slots: {
                  prefix: "thirdDivInput-prefix"
                }
              }
            ]
          }
        }
      ]
    }
  },
  {
    componentType: "div",
    props: {
      customChildren: [
        {
          componentType: "el-input",
          props: {
            modelValue: secondDivInputVModel1,
            placeholder: "请输入secondDivInputVModel-1"
          },
          slots: {
            prefix: "secondDivInput1-prefix"
          },
          //   点击事件
          events: {
            click: () => {
              console.log("secondDivInput1::click")
            }
          }
        },
        {
          componentType: "el-input",
          props: {
            modelValue: secondDivInputVModel2,
            placeholder: "请输入secondDivInputVModel-2",
            prefixValue: "prefix2"
          },
          slots: {
            prefix: "secondDivInput2-prefix"
          }
        },
        {
          componentType: "el-button",
          content: "点击",
          props: {
            type: "primary"
          },
          events: {
            click: () => {
              window.alert("点击")
              console.log("secondDivInput2::click")
            }
          }
        },
        {
          // 使用子节点形式渲染子组件
          componentType: "el-select",
          props: {
            modelValue: secondDivSelectVModel,
            placeholder: "请选择1",
            customChildren: secondDivSelectOptions
          }
        },
        {
          // 使用插槽形式渲染子组件
          componentType: "el-select",
          props: {
            modelValue: secondDivSelectVModel,
            placeholder: "请选择2",
            options: secondDivSelectOptions
          },
          slots: {
            default: "secondDivSelect-default"
          }
        },
        {
          componentType: "el-button",
          content: "点击增加options",
          props: {
            type: "primary"
          },
          events: {
            click: () => {
              optionsNumber.value++
            }
          }
        }
      ]
    }
  }
])

// 使用computed返回的配置, 需要手动添加update:modelValue事件，否则无法触发响应式
const multiComputedNodeConfig = computed(() => {
  return [
    {
      componentType: "el-select",
      props: {
        class: "mt-[12px]",
        modelValue: secondDivSelectVModel.value,
        placeholder: "请选择Computed",
        customChildren: secondDivSelectOptions.value
      },
      events: {
        "update:modelValue": (value: string): void => {
          console.log("multiComputedNodeConfig::update:modelValue::触发", value)
          secondDivSelectVModel.value = value
        }
      }
    },
    {
      componentType: "el-input",
      props: {
        modelValue: secondDivInputVModel1.value,
        placeholder: "请输入secondDivInputVModel-1"
      },
      events: {
        "update:modelValue": (value: string): void => {
          console.log("multiComputedNodeConfig::update:modelValue::触发", value)
          secondDivInputVModel1.value = value
        }
      }
    }
  ]
})

defineOptions({
  name: "CustomRecursionDemo"
})
</script>

<style scoped lang="scss"></style>
