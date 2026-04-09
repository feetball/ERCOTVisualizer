<template>
  <Dialog :open="dialog" @update:open="v => { dialog = v; emit('update:modelValue', v) }">
    <DialogContent class="tw-max-w-2xl tw-max-h-[85vh] tw-overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Edit Widget' : 'Add Widget' }}</DialogTitle>
      </DialogHeader>

      <!-- Tabs -->
      <div class="tw-flex tw-gap-1 tw-border-b tw-border-border/50 tw-mb-4">
        <button v-for="t in tabs" :key="t.value" class="tab-btn" :class="{ active: tab === t.value }" @click="tab = t.value">
          {{ t.label }}
        </button>
      </div>

      <!-- General Tab -->
      <div v-show="tab === 'general'" class="tw-space-y-3">
        <div>
          <label class="field-label">Widget Type</label>
          <select v-model="form.type" :disabled="isEditing" class="field-select">
            <option v-for="wt in widgetTypes" :key="wt.value" :value="wt.value">{{ wt.label }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">Title</label>
          <Input v-model="form.title" placeholder="Widget title" />
        </div>
      </div>

      <!-- Data Source Tab -->
      <div v-show="tab === 'data'" class="tw-space-y-3">
        <div>
          <label class="field-label">Search Tags</label>
          <Input v-model="tagSearch" placeholder="Search ERCOT tags..." @input="searchTags" />
        </div>
        <div class="tw-max-h-48 tw-overflow-y-auto tw-border tw-border-border/50 tw-rounded-lg">
          <button
            v-for="tag in filteredTags"
            :key="tag.webId"
            class="tw-flex tw-items-center tw-justify-between tw-w-full tw-px-3 tw-py-2 tw-text-left tw-text-sm hover:tw-bg-accent/50 tw-transition-colors"
            :class="{ 'tw-bg-primary/10': form.config.tag === tag.webId }"
            @click="selectTag(tag)"
          >
            <div>
              <div class="tw-font-medium tw-text-foreground">{{ tag.name }}</div>
              <div class="tw-text-xs tw-text-muted-foreground">{{ tag.webId }}</div>
            </div>
            <span class="tw-text-xs tw-px-2 tw-py-0.5 tw-rounded tw-border tw-border-primary/30 tw-text-primary">{{ tag.unit }}</span>
          </button>
          <div v-if="filteredTags.length === 0" class="tw-px-3 tw-py-4 tw-text-sm tw-text-muted-foreground tw-text-center">No tags found</div>
        </div>

        <div>
          <label class="field-label">Selected Tag</label>
          <Input :model-value="form.config.tag" readonly />
        </div>
        <div>
          <label class="field-label">Duration (hours)</label>
          <input type="number" v-model.number="form.config.durationHours" min="1" max="168" class="field-input" />
        </div>

        <template v-if="form.type === 'gauge' || form.type === 'stat' || form.type === 'value' || form.type === 'trend'">
          <div class="tw-pt-2 tw-border-t tw-border-border/30">
            <span class="tw-text-xs tw-font-medium tw-text-muted-foreground tw-uppercase">Display Options</span>
          </div>
          <div>
            <label class="field-label">Display Label</label>
            <Input v-model="form.config.label" placeholder="Short label" />
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div>
              <label class="field-label">Unit</label>
              <Input v-model="form.config.unit" placeholder="Hz, MW, $" />
            </div>
            <div>
              <label class="field-label">Decimals</label>
              <input type="number" v-model.number="form.config.decimals" min="0" max="6" class="field-input" />
            </div>
          </div>
        </template>

        <template v-if="form.type === 'gauge'">
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div>
              <label class="field-label">Min Value</label>
              <input type="number" v-model.number="form.config.min" class="field-input" />
            </div>
            <div>
              <label class="field-label">Max Value</label>
              <input type="number" v-model.number="form.config.max" class="field-input" />
            </div>
          </div>
        </template>
      </div>

      <!-- Calculations Tab -->
      <div v-show="tab === 'calc'" class="tw-space-y-3">
        <div class="tw-rounded-lg tw-bg-primary/10 tw-border tw-border-primary/20 tw-p-3 tw-text-sm tw-text-foreground/80">
          <strong>Safe Calculations:</strong> Use simple expressions:
          <ul class="tw-mt-1 tw-ml-4 tw-list-disc tw-text-xs tw-space-y-0.5">
            <li><code>value * 2</code> — Multiply</li>
            <li><code>value / 100</code> — Divide</li>
            <li><code>value + 10</code> — Add</li>
            <li><code>value - 5</code> — Subtract</li>
          </ul>
        </div>
        <div>
          <label class="field-label">Calculation Expression (optional)</label>
          <Input v-model="form.config.calculation" placeholder="value * 1.0" />
        </div>
      </div>

      <!-- Styling Tab -->
      <div v-show="tab === 'style'" class="tw-space-y-3">
        <div class="tw-flex tw-items-center tw-gap-2">
          <div class="tw-flex-1">
            <label class="field-label">Title Color</label>
            <Input v-model="form.style.titleColor" placeholder="#FFFFFF" />
          </div>
          <input type="color" v-model="form.style.titleColor" class="tw-w-8 tw-h-8 tw-rounded tw-border-none tw-cursor-pointer tw-mt-5" />
        </div>
        <div>
          <label class="field-label">Title Font Size</label>
          <select v-model="form.style.titleSize" class="field-select">
            <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <div class="tw-flex-1">
            <label class="field-label">Background Color</label>
            <Input v-model="form.style.backgroundColor" placeholder="#1E1E1E" />
          </div>
          <input type="color" v-model="form.style.backgroundColor" class="tw-w-8 tw-h-8 tw-rounded tw-border-none tw-cursor-pointer tw-mt-5" />
        </div>
        <div class="tw-flex tw-items-center tw-gap-2">
          <div class="tw-flex-1">
            <label class="field-label">Value/Line Color</label>
            <Input v-model="form.style.valueColor" placeholder="#4CAF50" />
          </div>
          <input type="color" v-model="form.style.valueColor" class="tw-w-8 tw-h-8 tw-rounded tw-border-none tw-cursor-pointer tw-mt-5" />
        </div>
      </div>

      <DialogFooter class="tw-mt-4">
        <Button variant="ghost" @click="close">Cancel</Button>
        <Button @click="save" :disabled="!form.title?.trim() || !form.config.tag">{{ isEditing ? 'Update' : 'Add' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ERCOT_TAGS } from '@/services/dataService'
import type { WidgetType, WidgetStyle } from '@/types/widget'

interface ErcotTag { webId: string; name: string; path: string; description: string; unit: string; nominal: number; min: number; max: number }
interface WidgetFormConfig { tag: string; durationHours: number; calculation: string; label: string; min: number; max: number; unit: string; decimals: number }
interface WidgetForm { type: WidgetType; title: string; config: WidgetFormConfig; style: WidgetStyle }

const props = defineProps<{
  modelValue: boolean
  editWidget?: { type?: WidgetType; title?: string; config?: Partial<WidgetFormConfig>; style?: Partial<WidgetStyle> } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: WidgetForm & { isEditing: boolean }]
}>()

const dialog = ref(false)
const tab = ref('general')
const isEditing = ref(false)
const tagSearch = ref('')

const tabs = [
  { label: 'General', value: 'general' },
  { label: 'Data Source', value: 'data' },
  { label: 'Calculations', value: 'calc' },
  { label: 'Styling', value: 'style' },
]

const widgetTypes = [
  { label: 'Line Chart', value: 'chart' },
  { label: 'Stacked Area Chart', value: 'stacked' },
  { label: 'Single Value', value: 'value' },
  { label: 'Stat (Grafana-style)', value: 'stat' },
  { label: 'Gauge', value: 'gauge' },
  { label: 'Data Table', value: 'table' },
  { label: 'ERCOT Map', value: 'map' },
  { label: 'Trend', value: 'trend' },
  { label: 'Heat Calendar', value: 'heatcalendar' },
  { label: 'Mini Dashboard', value: 'minidash' },
]

const fontSizes = ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem', '2rem']

const ercotTags: ErcotTag[] = Object.values(ERCOT_TAGS).map(tag => ({
  webId: tag.webId, name: tag.name, path: `\\\\ERCOT\\${tag.webId.replace('ERCOT.', '')}`,
  description: tag.description, unit: tag.unit, nominal: tag.nominal, min: tag.min, max: tag.max,
}))

const filteredTags = ref<ErcotTag[]>(ercotTags)

const defaultForm = (): WidgetForm => ({
  type: 'chart', title: '',
  config: { tag: '', durationHours: 4, calculation: '', label: '', min: 0, max: 100, unit: '', decimals: 2 },
  style: { titleColor: '', titleSize: '1rem', backgroundColor: '', valueColor: '' },
})

const form = reactive<WidgetForm>(defaultForm())

watch(() => props.modelValue, (val) => {
  dialog.value = val
  if (val) {
    tab.value = 'general'
    if (props.editWidget) {
      isEditing.value = true
      Object.assign(form, {
        type: props.editWidget.type || 'chart', title: props.editWidget.title || '',
        config: { ...defaultForm().config, ...props.editWidget.config },
        style: { ...defaultForm().style, ...props.editWidget.style },
      })
    } else {
      isEditing.value = false
      Object.assign(form, defaultForm())
    }
  }
})

watch(dialog, val => emit('update:modelValue', val))

function searchTags() {
  const q = tagSearch.value?.toLowerCase() || ''
  filteredTags.value = ercotTags.filter(t => t.name.toLowerCase().includes(q) || t.path.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
}

function selectTag(tag: ErcotTag) {
  form.config.tag = tag.webId
  if (!form.title) form.title = tag.name
  if (tag.unit) form.config.unit = tag.unit
  if (tag.min !== undefined) form.config.min = tag.min
  if (tag.max !== undefined) form.config.max = tag.max
}

function close() { dialog.value = false }
function save() { emit('save', { ...form, isEditing: isEditing.value }); dialog.value = false }
</script>

<style scoped>
.tab-btn {
  padding: 6px 12px; font-size: 12px; font-weight: 500;
  color: hsl(var(--muted-foreground)); border-bottom: 2px solid transparent;
  background: transparent; cursor: pointer; transition: all 0.15s;
}
.tab-btn:hover { color: hsl(var(--foreground)); }
.tab-btn.active { color: hsl(var(--primary)); border-bottom-color: hsl(var(--primary)); }
.field-label { display: block; font-size: 12px; font-weight: 500; color: hsl(var(--muted-foreground)); margin-bottom: 4px; }
.field-input {
  width: 100%; height: 36px; padding: 0 10px; border-radius: 6px; font-size: 13px;
  border: 1px solid hsl(var(--input)); background: transparent; color: hsl(var(--foreground));
  outline: none; transition: border-color 0.15s;
}
.field-input:focus { border-color: hsl(var(--ring)); }
.field-select {
  width: 100%; height: 36px; padding: 0 10px; border-radius: 6px; font-size: 13px;
  border: 1px solid hsl(var(--input)); background: hsl(var(--card)); color: hsl(var(--foreground));
  outline: none; cursor: pointer;
}
.field-select:focus { border-color: hsl(var(--ring)); }
.field-select option { background: hsl(var(--card)); color: hsl(var(--foreground)); }
</style>
