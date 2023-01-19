<template>
  <div class="info-files">
    <h5>Чаты и Участники</h5>
    <section class="info-files--list">
      <div class="list-item">
        <div class="item-actions">
          <button
            name="download"
            type="button"
            class="btn action-button btn-download"
            @click="downloadChatPublic($event)"
          >
            <span class="material-icons">download</span>
            <span class="btn-loader">
              <Preloader></Preloader>
            </span>
          </button>
        </div>
        <span class="item-name">Сообщения общего чата</span>
      </div>
      <div class="list-item">
        <div class="item-actions">
          <button
            name="download"
            type="button"
            class="btn action-button btn-download"
            @click="downloadChatPrivate($event)"
          >
            <span class="material-icons">download</span>
            <span class="btn-loader">
              <Preloader></Preloader>
            </span>
          </button>
        </div>
        <span class="item-name">Сообщения личных чатов</span>
      </div>
      <div class="list-item">
        <div class="item-actions">
          <button
            name="download"
            type="button"
            class="btn action-button btn-download"
            @click="downloadListUsers($event)"
          >
            <span class="material-icons">download</span>
            <span class="btn-loader">
              <Preloader></Preloader>
            </span>
          </button>
        </div>
        <span class="item-name">Список участников</span>
      </div>
    </section>
  </div>
</template>

<script>
import fileApi from "@/api/infoFile";
import Preloader from "@/components/common/Preloader";
export default {
  name: 'InfoFiles',
  components: {Preloader},
  setup(){
    const downloadFile = (response, fileName) => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(response.data)
      link.download = fileName
      link.click()
    }

    const downloadChatPublic = (e) => {
      const btnClassList = e.target.classList
      btnClassList.add('load') 
      fileApi.downloadChatPublic()
      .then(response => downloadFile(response,"Общий чат.xlsx"))
      .catch(reason => console.error(reason))
      .finally(() => btnClassList.remove('load'))
    }

    const downloadChatPrivate = (e) => {
      const btnClassList = e.target.classList
      btnClassList.add('load') 
      fileApi.downloadChatPrivate()
      .then(response => downloadFile(response,"Личные чаты.xlsx"))
      .catch(reason => console.error(reason))
      .finally(() => btnClassList.remove('load'))
    }

    const downloadListUsers = (e) => {
      const btnClassList = e.target.classList
      btnClassList.add('load') 
      fileApi.downloadListUsers()
      .then(response => downloadFile(response,"Список участников.xlsx"))
      .catch(reason => console.error(reason))
      .finally(() => btnClassList.remove('load'))
    }


    return {
      downloadChatPublic,
      downloadChatPrivate,
      downloadListUsers,
    }
  }
};
</script>

<style scoped lang='scss'>
.info-files {
  margin: 10px 0;
  border-bottom: 1px dashed #4d4d4d;
}
</style>