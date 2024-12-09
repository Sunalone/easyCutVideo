<template>
  <el-aside id="drag-zone" width="240px">
    <div class="top-box">
      <el-tooltip content="请拖拽视频进行添加">
        <el-text> 视频列表 </el-text>
      </el-tooltip>
      <el-tooltip content="开始剪辑">
        <el-button type="primary" :icon="VideoCamera" @click="handleEdit">
        </el-button>
      </el-tooltip>
    </div>
    <div class="space">
      <div
        v-for="(item, index) in videoList"
        :key="item.videoName"
        :class="[
          'videoItem',
          { active: item.videoName === activeVideoItemName ? true : false },
        ]"
        @click="() => handleClick(item, index)"
      >
        <el-icon style="margin-right: 8px"><Film /></el-icon>
        <el-text>
          {{ item.videoName }}
        </el-text>
        <el-icon class="deleteSpace" @click="() => handleDeleteVideo(index)"
          ><Delete
        /></el-icon>
      </div>
    </div>
  </el-aside>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Delete, Film, VideoCamera } from "@element-plus/icons-vue";
import { TVideo } from "../../../types";
import { ElMessageBox } from "element-plus";

defineProps<{
  videoList: TVideo[];
}>();

const emit = defineEmits(["clickVideoItem", "deleteVideo", "startEditVideo"]);
const activeVideoItemName = ref("");

const handleEdit = async () => {
  emit("startEditVideo");
};

const handleClick = (item: TVideo, index: number) => {
  activeVideoItemName.value = item.videoName;
  emit("clickVideoItem", item, index);
};

const handleDeleteVideo = async (index: number) => {
  await ElMessageBox.confirm("确定删除该视频吗", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  });
  emit("deleteVideo", index);
};
</script>
<style scoped>
.el-aside {
  color: var(--el-text-color-primary);
  padding: 0 12px;
  border-right: 1px solid #e4e4e7;
}
.top-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}
.space {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.space .deleteSpace {
  margin-left: auto;
}

.space .deleteSpace:hover {
  color: #79bbff;
}

.active {
  background-color: #e0f2fe;
}

.videoItem {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 12px;
  height: 42px;
  border-radius: 6px;
  cursor: pointer;
}

.videoItem:hover {
  background-color: #f0f9ff;
}

.top-box .el-text {
  font-size: 20px;
  font-weight: 600;
}
</style>
