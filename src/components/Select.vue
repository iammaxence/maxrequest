<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
  
  type OptionValue = string | number | null;
  
  export type Option = {
    label: string;
    value: OptionValue;
    disabled?: boolean;
  };
  
  const props = withDefaults(
    defineProps<{
      modelValue: OptionValue;
      options: Option[];
      label?: string;
      placeholder?: string;
      disabled?: boolean;
      searchable?: boolean;
      clearable?: boolean;
      error?: string;
      hint?: string;
    }>(),
    {
      label: "Select",
      placeholder: "Choose an option",
      disabled: false,
      searchable: true,
      clearable: true,
      error: "",
      hint: "",
    }
  );
  
  const emit = defineEmits<{
    (e: "update:modelValue", v: OptionValue): void;
    (e: "change", v: OptionValue): void;
    (e: "open"): void;
    (e: "close"): void;
  }>();
  
  const rootEl = ref<HTMLElement | null>(null);
  const searchEl = ref<HTMLInputElement | null>(null);
  
  const isOpen = ref(false);
  const query = ref("");
  const activeIndex = ref(-1);
  
  const selected = computed(() => props.options.find(o => o.value === props.modelValue) ?? null);
  
  const hasValue = computed(() => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== "");
  
  const filteredOptions = computed(() => {
    const q = query.value.trim().toLowerCase();
    const list = props.options;
  
    if (!props.searchable || !q) return list;
  
    return list.filter(o => o.label.toLowerCase().includes(q));
  });
  
  function open() {
    if (props.disabled) return;
    if (isOpen.value) return;
  
    isOpen.value = true;
    emit("open");
  
    // set active option near current selection
    const idx = filteredOptions.value.findIndex(o => o.value === props.modelValue && !o.disabled);
    activeIndex.value = idx >= 0 ? idx : (filteredOptions.value.findIndex(o => !o.disabled) ?? -1);
  
    nextTick(() => {
      if (props.searchable) searchEl.value?.focus();
    });
  }
  
  function close() {
    if (!isOpen.value) return;
    isOpen.value = false;
    emit("close");
    query.value = "";
    activeIndex.value = -1;
  }
  
  function toggle() {
    isOpen.value ? close() : open();
  }
  
  function selectOption(opt: Option) {
    if (props.disabled || opt.disabled) return;
    emit("update:modelValue", opt.value);
    emit("change", opt.value);
    close();
  }
  
  function clear() {
    if (props.disabled) return;
    emit("update:modelValue", null);
    emit("change", null);
  }
  
  function moveActive(delta: number) {
    const list = filteredOptions.value;
    if (!list.length) return;
  
    let idx = activeIndex.value;
  
    // if none active, start at first enabled
    if (idx < 0) idx = list.findIndex(o => !o.disabled);
  
    for (let i = 0; i < list.length; i++) {
      idx = (idx + delta + list.length) % list.length;
      if (!list[idx].disabled) {
        activeIndex.value = idx;
        scrollActiveIntoView();
        return;
      }
    }
  }
  
  function scrollActiveIntoView() {
    const root = rootEl.value;
    if (!root) return;
    const el = root.querySelector<HTMLElement>("[data-active='true']");
    const menu = root.querySelector<HTMLElement>("[data-menu]");
    if (!el || !menu) return;
  
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const viewTop = menu.scrollTop;
    const viewBottom = viewTop + menu.clientHeight;
  
    if (elTop < viewTop) menu.scrollTop = elTop - 8;
    else if (elBottom > viewBottom) menu.scrollTop = elBottom - menu.clientHeight + 8;
  }
  
  function onKeydown(e: KeyboardEvent) {
    if (props.disabled) return;
  
    if (!isOpen.value) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        open();
      }
      return;
    }
  
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filteredOptions.value[activeIndex.value];
      if (opt) selectOption(opt);
    }
  }
  
  function onOutsideClick(e: MouseEvent) {
    const root = rootEl.value;
    if (!root) return;
    if (!root.contains(e.target as Node)) close();
  }
  
  watch(query, () => {
    // reset active to first enabled when filtering changes
    const idx = filteredOptions.value.findIndex(o => !o.disabled);
    activeIndex.value = idx;
  });
  
  onMounted(() => document.addEventListener("mousedown", onOutsideClick));
  onBeforeUnmount(() => document.removeEventListener("mousedown", onOutsideClick));
  </script>
  
  <template>
    <div
      ref="rootEl"
      class="v3select"
      :class="{
        'is-open': isOpen,
        'is-disabled': disabled,
        'has-error': !!error,
      }"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-disabled="disabled ? 'true' : 'false'"
      @keydown="onKeydown"
    >
      <div class="field" @click="toggle">
        <div class="field__wrapper">
          <label class="label" :class="{ floated: isOpen || hasValue }">{{ label }}</label>
          <div class="value">
            <span v-if="selected" class="valueText">{{ selected.label }}</span>
            <span v-else class="placeholder">{{ placeholder }}</span>
          </div>  
        </div>
  
        <div class="actions">
          <button
            v-if="clearable && hasValue && !disabled"
            class="iconBtn"
            type="button"
            aria-label="Clear"
            @click.stop="clear"
          >
            ✕
          </button>
  
          <span class="chev" aria-hidden="true">▾</span>
        </div>
      </div>
  
      <transition name="pop">
        <div v-if="isOpen" class="panel" @mousedown.prevent>
          <div v-if="searchable" class="searchWrap">
            <input
              ref="searchEl"
              v-model="query"
              class="search"
              type="text"
              :placeholder="`Search ${label.toLowerCase()}...`"
              autocomplete="off"
            />
          </div>
  
          <div class="menu" data-menu>
            <button
              v-for="(opt, idx) in filteredOptions"
              :key="String(opt.value) + opt.label"
              type="button"
              class="item"
              :class="{
                selected: opt.value === modelValue,
                disabled: !!opt.disabled,
                active: idx === activeIndex,
              }"
              :disabled="disabled || opt.disabled"
              :data-active="idx === activeIndex ? 'true' : 'false'"
              @mousemove="!opt.disabled && (activeIndex = idx)"
              @click="selectOption(opt)"
            >
              <span class="itemLabel">{{ opt.label }}</span>
              <span v-if="opt.value === modelValue" class="check" aria-hidden="true">✓</span>
            </button>
  
            <div v-if="!filteredOptions.length" class="empty">No results</div>
          </div>
        </div>
      </transition>
  
      <div v-if="error" class="msg error">{{ error }}</div>
      <div v-else-if="hint" class="msg hint">{{ hint }}</div>
    </div>
  </template>
  
  <style scoped>
  /* --- theme tokens --- */
  .v3select {
    --bg: rgba(255, 255, 255, 0.06);
    --bg2: rgba(255, 255, 255, 0.09);
    --stroke: rgba(255, 255, 255, 0.14);
    --stroke2: rgba(255, 255, 255, 0.22);
    --text: rgba(255, 255, 255, 0.92);
    --muted: rgba(255, 255, 255, 0.62);
    --shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    --radius: 14px;
  
    /* accent */
    --accent: 124 92 255; /* rgb */
    --accent2: 65 240 207;
  
    width: 100%;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    outline: none;
  }
  
  /* Container focus ring */
  .v3select:focus-visible .field {
    box-shadow:
      0 0 0 4px rgba(var(--accent), 0.18),
      0 0 0 1px rgba(var(--accent), 0.45);
  }
  
  .field {
    position: relative;
    display: flex;
    justify-content: space-between;

    min-height: 54px;
    padding: 12px 12px;

    border-top-left-radius: var(--radius);
    border-top-right-radius: var(--radius);

    background: linear-gradient(180deg, var(--bg), rgba(255,255,255,0.03));
    border: 1px solid var(--stroke);
    cursor: pointer;
    transition: transform 0.08s ease, border-color 0.2s ease, background 0.2s ease;

    &__wrapper {
      display: flex;
      flex-direction: column;
    }
  }
  
  .field:hover {
    border-color: var(--stroke2);
    background: linear-gradient(180deg, var(--bg2), rgba(255,255,255,0.04));
  }
  
  .is-open .field {
    border-color: rgba(var(--accent), 0.55);
  }
  
  .is-disabled .field {
    opacity: 0.55;
    cursor: not-allowed;
  }
  
  .value {
    min-width: 0;
    padding-top: 6px;
  }
  
  .valueText {
    display: block;
    color: var(--text);
    font-size: 15px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .placeholder {
    display: block;
    color: var(--muted);
    font-size: 15px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .label {
    color: var(--muted);
    font-size: 14px;
    pointer-events: none;
  }
  
  .actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .iconBtn {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    cursor: pointer;
    transition: transform 0.08s ease, background 0.2s ease;
  }
  .iconBtn:hover { background: rgba(255,255,255,0.10); }
  .iconBtn:active { transform: scale(0.98); }
  
  .chev {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    transition: transform 0.15s ease;
  }
  
  .is-open .chev {
    transform: rotate(180deg);
  }
  
  /* Panel */
  .panel {
    position: absolute;
    z-index: 2;
    left: 15px;
    right: 15px;

    border-bottom-left-radius: calc(var(--radius) + 2px);
    border-bottom-right-radius: calc(var(--radius) + 2px);
    border: 1px solid rgba(255,255,255,0.14);

    background: rgba(20, 20, 24, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  
  .searchWrap {
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.10);
  }
  
  .search {
    width: 100%;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    outline: none;
  }
  .search:focus {
    border-color: rgba(var(--accent), 0.55);
    box-shadow: 0 0 0 4px rgba(var(--accent), 0.16);
  }
  .search::placeholder { color: rgba(255,255,255,0.45); }
  
  .menu {
    max-height: 260px;
    overflow: auto;
    padding: 8px;
  }
  
  .item {
    width: 100%;
    border: 0;
    text-align: left;
    border-radius: 12px;
    padding: 10px 10px;
    background: transparent;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.08s ease;
  }
  
  .item:hover {
    background: rgba(255,255,255,0.08);
  }
  
  .item.active {
    background: rgba(var(--accent), 0.20);
    box-shadow: inset 0 0 0 1px rgba(var(--accent), 0.35);
  }
  
  .item.selected .itemLabel {
    color: rgba(255,255,255,0.98);
  }
  
  .item.disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  
  .check {
    font-size: 14px;
    opacity: 0.9;
  }
  
  .empty {
    padding: 14px 12px;
    color: rgba(255,255,255,0.55);
  }
  
  /* Messages */
  .msg {
    margin-top: 8px;
    font-size: 12px;
  }
  .msg.hint { color: rgba(255,255,255,0.60); }
  .msg.error { color: rgba(255, 120, 140, 0.95); }
  
  .has-error .field {
    border-color: rgba(255, 120, 140, 0.55);
    box-shadow: 0 0 0 4px rgba(255, 120, 140, 0.12);
  }
  
  /* Transition */
  .pop-enter-active,
  .pop-leave-active {
    transition: opacity 0.14s ease, transform 0.14s ease;
  }
  .pop-enter-from,
  .pop-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.99);
  }
  </style>
  