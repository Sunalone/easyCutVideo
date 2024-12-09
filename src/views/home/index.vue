<template>
  <el-container v-loading="loading" style="height: 100vh">
    <Aside
      :videoList="videoList"
      @clickVideoItem="handleClickVideoItem"
      @deleteVideo="handleDeleteVideo"
      @startEditVideo="handleEditVideo"
    />
    <el-container>
      <Main
        :currentVideo="currentVideo"
        @changeOutputPath="handleChangeOutputPath"
        @changeFragment="handleChangeFragment"
        @deleteFragment="handleDeleteFragment"
      />
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Aside from "./components/Aside.vue";
import Main from "./components/Main.vue";
import { TFile, TFragment, TVideo } from "../../types";
import { ElMessageBox } from "element-plus";

const loading = ref(false);
const currentVideo = ref<TVideo>();
const videoList = ref<TVideo[]>([]);
const currentVideoIndex = ref<number | null>(null);

// 符合条件的文件后缀
const extensions = ["mp4", "avi", "mov", "mkv", "m4v", "rmvb", "ts"];

const geTVideoExtension = (fileName: string) => {
  const index = fileName.lastIndexOf(".");
  return fileName.slice(index + 1);
};

// 校验文件名
const validateFileName = (fileName: string) => {
  const fileExtension = geTVideoExtension(fileName);
  return extensions.includes(fileExtension);
};

onMounted(() => {
  const app = document.getElementById("app");

  if (app) {
    ["dragover", "dragenter", "dragleave"].forEach((eventName) => {
      app.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    app.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const failedFileNameList: string[] = [];
      // 过滤不是视频的文件，并将非视频的文件保存名字提示用户
      const inpuTVideos = Array.from(
        e.dataTransfer?.files as unknown as TFile[]
      );
      const files = inpuTVideos?.filter((item) => {
        if (validateFileName(item.name)) {
          return true;
        } else {
          failedFileNameList.push(item.name + "\n");
        }
      });
      console.log(files, "files");
      const fileList: TVideo[] = files.map((item) => ({
        videoName: item.name,
        inputPath: item.path.replace(/\\/g, "/"),
        // inputPath: "C:/Users/Administrator/Desktop/test/file/A.mp4",
        fragmentList: [],
        outputPath: "C:/\Users/\Administrator/\Desktop",
      }));
      videoList.value.push(...fileList);
      console.log(videoList.value, "视频列表");

      if (failedFileNameList.length > 0) {
        ElMessageBox.alert(
          `${failedFileNameList.join(",")}添加失败，不属于视频文件!`,
          "提示",
          {
            type: "error",
            confirmButtonText: "确认",
          }
        );
      }
    });
  }
});

const handleClickVideoItem = (videoItem: TVideo, index: number) => {
  currentVideoIndex.value = index;
  currentVideo.value = videoItem;
};

const handleDeleteVideo = (index: number) => {
  videoList.value.splice(index, 1);
};

const handleChangeOutputPath = (directoryPath?: string) => {
  if (currentVideo.value && currentVideoIndex.value !== null) {
    const copyCurrentVideo = JSON.parse(JSON.stringify(currentVideo.value));
    copyCurrentVideo.outputPath = directoryPath;
    currentVideo.value = copyCurrentVideo;
    console.log(currentVideo.value, "当前视频");

    videoList.value.splice(currentVideoIndex.value, 1, copyCurrentVideo);
  }
};

const handleChangeFragment = (fragment: TFragment) => {
  if (currentVideo.value && currentVideoIndex.value !== null) {
    const copyCurrentVideo = JSON.parse(JSON.stringify(currentVideo.value));
    copyCurrentVideo.fragmentList!.push(fragment);
    currentVideo.value = copyCurrentVideo;
    videoList.value[currentVideoIndex.value] = copyCurrentVideo;
    console.log(currentVideo.value, "当前视频");
    console.log(videoList.value, "当前视频列表");
  }
};

const handleDeleteFragment = (id: number) => {
  if (currentVideo.value) {
    const index = currentVideo.value.fragmentList!.findIndex(
      (item) => item.id === id
    );
    currentVideo.value.fragmentList?.splice(index, 1);

    if (currentVideoIndex.value) {
      videoList.value[currentVideoIndex.value].fragmentList =
        currentVideo.value!.fragmentList;
    }
  }
};

const handleEditVideo = () => {
  if (!videoList?.value.length) {
    return;
  }
  const copyVideoList = JSON.parse(JSON.stringify(videoList.value)) as TVideo[];
  const filteredVideoList = copyVideoList.filter((video) =>
    Boolean(video.fragmentList?.length)
  );
  console.log(filteredVideoList, "过滤后的视频列表");
  window.electronAPI!.editVideo(filteredVideoList);
  window.electronAPI!.onSetLoading((_: any, isLoading: boolean) => {
    loading.value = isLoading;
    if (!isLoading) {
      ElMessageBox.alert("剪辑成功", "提示", {
        confirmButtonText: "确认",
        type: "success",
      });
    }
  });
};
</script>

<style scoped></style>
