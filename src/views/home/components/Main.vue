<template>
  <el-main>
    <el-scrollbar v-if="currentVideo">
      <div class="outPath">
        <el-text>输出路径</el-text>
        <el-input v-model="outPath" class="input" />
        <el-tooltip content="修改输出路径">
          <el-button type="primary" :icon="Edit" @click="handleOutputPath" />
        </el-tooltip>
        <el-tooltip content="新增裁剪片段">
          <el-button
            style="margin-left: 0px"
            type="primary"
            :icon="Plus"
            @click="dialogVisible = true"
          />
        </el-tooltip>
      </div>
      <el-table :data="fragmentList">
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column props="operation" label="操作">
          <template v-slot="scope">
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="() => handleDelete(scope.row.id)"
            >
              <template #reference>
                <el-button link type="primary"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>

    <el-dialog
      v-model="dialogVisible"
      title="新增片段"
      width="400"
      :before-close="(done:any)=>done()"
    >
      <el-text size="small" type="primary"> 格式为： HH:MM:SS </el-text>
      <el-form
        ref="formRef"
        :model="form"
        style="margin-top: 12px"
        :rules="{
          startTime: [
            { required: true, message: '请填写开始片段', trigger: 'change' },
          ],
          endTime: [
            { required: true, message: '请填写结束片段', trigger: 'change' },
          ],
        }"
      >
        <el-form-item label="开始时间" prop="startTime">
          <el-input v-model="form.startTime" />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-input v-model="form.endTime" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from "vue";
import { Edit, Plus } from "@element-plus/icons-vue";
import { TFragment, TVideo } from "../../../types";

const props = defineProps<{
  currentVideo?: TVideo;
}>();
const emit = defineEmits([
  "changeOutputPath",
  "changeFragment",
  "deleteFragment",
]);

const formRef = ref();

const fragmentList = computed(() => {
  return props.currentVideo && props.currentVideo.fragmentList;
});
const outPath = computed(() => {
  return props.currentVideo && props.currentVideo.outputPath;
});
let fragmentIndex = 999;

const dialogVisible = ref(false);
const form = ref<TFragment>({
  startTime: "",
  endTime: "",
  startSeconds: undefined,
  endSeconds: undefined,
});

const handleOutputPath = async () => {
  window.electronAPI!.openFileDialog();
  window.electronAPI!.onFileDialogResult((_: any, directoryPath: string) => {
    console.log("Selected files:", directoryPath);
    if (!directoryPath) {
      return;
    }
    emit("changeOutputPath", directoryPath[0]);
  });
};

const handleConfirm = async () => {
  await formRef.value.validate();
  fragmentIndex -= 1;
  dialogVisible.value = false;
  form.value.startSeconds = timeToSeconds(form.value.startTime);
  form.value.endSeconds = timeToSeconds(form.value.endTime);
  emit("changeFragment", { ...form.value, id: fragmentIndex });
};

const handleDelete = (id: number) => {
  emit("deleteFragment", id);
};

const timeToSeconds = (timeStr: string) => {
  // 使用冒号分割时间字符串为小时、分钟和秒
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);

  // 计算总秒数
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
};
</script>

<style scoped>
.el-main {
  padding: 12px;
}
.outPath {
  display: flex;
  width: 80%;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.input {
  flex: 1;
}
</style>
