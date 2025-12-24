<script setup lang="ts">
import Select, { Option } from "@/components/Select.vue";
import InputText from "@/components/InputText.vue";
import TextArea from "@/components/TextArea.vue";
import Toggle from "@/components/Toggle.vue";
import { ref, watch } from "vue";
  
const HTTP_METHODS: Option[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE'},
  { label: 'PATCH', value: 'PATCH'}
]

const mockConfig = ref({
  enabled: false,
  method: "GET",
  urlPart: "",
  response: '{"success": true, "message": "Thanks to use maxrequest !"}',
});

watch(
  mockConfig,
  () => applyMock(),
  { deep: true }
);
  
function _sendToTab(tabId: number, message: any) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (resp) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(resp);
    });
  });
}
  
const applyMock = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    console.error('No active tab')
    return;
  };

  console.log("[panel] active tab:", tab.id, tab.url);

  try {
    const resp = await _sendToTab(tab.id, {
      type: "SET_MOCK",
      payload: mockConfig.value,
    });
    console.log("[panel] response:", resp);
  } catch (e: any) {
    console.warn("[panel] sendMessage failed:", e?.message || e);
  }
};
</script>  

<template>
  <div class="mock-panel">
    <Toggle v-model="mockConfig.enabled" label="Active"></Toggle>
    <Select v-model="mockConfig.method" :options="HTTP_METHODS"/>
    <InputText v-model="mockConfig.urlPart" label="URL path" />
    <TextArea v-model="mockConfig.response" label="Expected JSON response"/>
  </div>
</template>

<style scoped>
.mock-panel {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
}
</style>
