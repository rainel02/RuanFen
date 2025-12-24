<template>
  <div class="vanta-banner" ref="wrap">
    <div class="vanta-content"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{ effect?: string; options?: Record<string, any> }>()
const wrap = ref<HTMLElement | null>(null)
let vantaEffect: any = null

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load ' + src))
    document.head.appendChild(s)
  })
}

const EFFECT_SCRIPTS: Record<string, string> = {
  NET: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js',
  WAVES: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js',
  GLOBE: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js',
  BIRDS: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js',
  DOTS: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js'
}

onMounted(async () => {
  const effect = (props.effect || 'NET').toUpperCase()
  try {
    // ensure three is present
    if (!(window as any).THREE) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js')
    }
    const script = EFFECT_SCRIPTS[effect] || EFFECT_SCRIPTS.NET
    await loadScript(script)

    const vantaKey = effect
    const VANTA = (window as any).VANTA
    if (VANTA && VANTA[vantaKey] && wrap.value) {
      const defaultOptions = {
        el: wrap.value,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 150,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        /* theme defaults: color (pink) and backgroundColor (deep purple) */
        color: 0xff3f81,
        backgroundColor: 0x23153c
      }

      vantaEffect = VANTA[vantaKey](Object.assign({}, defaultOptions, props.options || {}))
    }
  } catch (e) {
    // fail silently
  }
})

onBeforeUnmount(() => {
  if (vantaEffect && typeof vantaEffect.destroy === 'function') {
    vantaEffect.destroy()
    vantaEffect = null
  }
})
</script>

<style scoped>
.vanta-banner{
  position: relative;
  width: 100%;
  min-height: 140px;
  display: block;
}
.vanta-banner > .vanta-content{
  position: relative;
  z-index: 2;
  padding: 14px 18px;
}
.vanta-banner canvas{
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
}
</style>
