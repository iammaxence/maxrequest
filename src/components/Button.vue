<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      label: string;
      type?: "button" | "submit" | "reset";
      disabled?: boolean;
    }>(),
    {
      type: "button",
      disabled: false,
    }
  );
  
  const emit = defineEmits<{
    (e: "click", ev: MouseEvent): void;
  }>();
  
  function onClick(ev: MouseEvent) {
    if (props.disabled) return;
    emit("click", ev);
  }
</script>
  
<template>
  <button class="v3btn" :type="type" :disabled="disabled" @click="onClick">
    {{ label }}
  </button>
</template>
  
<style scoped>
.v3btn {
  --bg: rgba(255, 255, 255, 0.06);
  --bg2: rgba(255, 255, 255, 0.09);
  --stroke: rgba(255, 255, 255, 0.14);
  --stroke2: rgba(255, 255, 255, 0.22);
  --text: rgba(255, 255, 255, 0.92);
  --radius: 14px;

  --accent: 124 92 255;
  --accent2: 65 240 207;

  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius);
  padding: 12px 14px;
  min-height: 46px;
  width: 100%;

  cursor: pointer;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.2px;

  background: linear-gradient(
    135deg,
    rgba(var(--accent), 0.55),
    rgba(var(--accent2), 0.35)
  );
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);

  transition: transform 0.08s ease, filter 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.v3btn:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow:
    0 14px 38px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.v3btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
}

.v3btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 4px rgba(var(--accent), 0.18),
    0 0 0 1px rgba(var(--accent), 0.55),
    0 14px 38px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.v3btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(0.2);
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
</style>
  