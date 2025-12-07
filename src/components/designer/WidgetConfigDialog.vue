<template>
  <v-dialog v-model="dialog" max-width="700" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ isEditing ? 'Edit Widget' : 'Add Widget' }}</span>
        <v-btn icon="mdi-close" variant="text" @click="close"></v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent">
          <v-tab value="general">General</v-tab>
          <v-tab value="data">Data Source</v-tab>
          <v-tab value="calc">Calculations</v-tab>
          <v-tab value="style">Styling</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab" class="mt-4">
          <!-- General Tab -->
          <v-tabs-window-item value="general">
            <v-form ref="formRef" v-model="formValid">
              <v-select
                v-model="form.type"
                :items="widgetTypes"
                item-title="label"
                item-value="value"
                label="Widget Type"
                density="compact"
                :disabled="isEditing"
                :rules="[rules.required]"
              ></v-select>
              <v-text-field
                v-model="form.title"
                label="Title"
                density="compact"
                :rules="[rules.required, rules.minLength(2)]"
                counter
                maxlength="50"
              ></v-text-field>
            </v-form>
          </v-tabs-window-item>

          <!-- Data Source Tab -->
          <v-tabs-window-item value="data">
            <v-text-field
              v-model="tagSearch"
              label="Search PI Tags"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              clearable
              @input="searchTags"
            ></v-text-field>
            <v-list density="compact" max-height="200" class="overflow-y-auto border rounded mb-4">
              <v-list-item
                v-for="tag in filteredTags"
                :key="tag.webId"
                :title="tag.name"
                :subtitle="`${tag.webId} (${tag.unit})`"
                @click="selectTag(tag)"
                :active="form.config.tag === tag.webId"
              >
                <template #append>
                  <v-chip size="x-small" color="primary" variant="outlined">{{ tag.unit }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item v-if="filteredTags.length === 0" title="No tags found"></v-list-item>
            </v-list>

            <v-text-field
              v-model="form.config.tag"
              label="Selected Tag / WebID"
              density="compact"
              readonly
            ></v-text-field>

            <v-text-field
              v-model.number="form.config.durationHours"
              label="Duration (hours)"
              type="number"
              density="compact"
              :rules="[rules.positiveNumber]"
              min="1"
              max="168"
            ></v-text-field>

            <!-- Gauge/Stat specific options -->
            <template v-if="form.type === 'gauge' || form.type === 'stat' || form.type === 'value'">
              <v-divider class="my-3"></v-divider>
              <div class="text-subtitle-2 mb-2">Display Options</div>
              
              <v-text-field
                v-model="form.config.label"
                label="Display Label"
                density="compact"
                hint="Short label shown on the widget"
              ></v-text-field>

              <v-text-field
                v-model="form.config.unit"
                label="Unit (e.g., Hz, MW, %)"
                density="compact"
              ></v-text-field>

              <v-text-field
                v-model.number="form.config.decimals"
                label="Decimal Places"
                type="number"
                density="compact"
                :rules="[rules.decimals]"
                min="0"
                max="6"
              ></v-text-field>
            </template>

            <!-- Gauge specific min/max -->
            <template v-if="form.type === 'gauge'">
              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="form.config.min"
                    label="Min Value"
                    type="number"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="form.config.max"
                    label="Max Value"
                    type="number"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>
            </template>
          </v-tabs-window-item>

          <!-- Calculations Tab -->
          <v-tabs-window-item value="calc">
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              <div class="text-body-2">
                <strong>Safe Calculations:</strong> Use simple expressions like:
                <ul class="mt-1 mb-0">
                  <li><code>value * 2</code> - Multiply by 2</li>
                  <li><code>value / 100</code> - Divide by 100</li>
                  <li><code>value + 10</code> - Add 10</li>
                  <li><code>value - 5</code> - Subtract 5</li>
                </ul>
              </div>
            </v-alert>
            <v-text-field
              v-model="form.config.calculation"
              label="Calculation Expression (optional)"
              placeholder="value * 1.0"
              density="compact"
              hint="Simple math: value * N, value / N, value + N, value - N"
              persistent-hint
            ></v-text-field>
          </v-tabs-window-item>

          <!-- Styling Tab -->
          <v-tabs-window-item value="style">
            <v-text-field
              v-model="form.style.titleColor"
              label="Title Color"
              density="compact"
              placeholder="#FFFFFF"
            >
              <template #append>
                <input type="color" v-model="form.style.titleColor" style="width: 30px; height: 30px; border: none; cursor: pointer;" />
              </template>
            </v-text-field>

            <v-select
              v-model="form.style.titleSize"
              :items="fontSizes"
              label="Title Font Size"
              density="compact"
            ></v-select>

            <v-text-field
              v-model="form.style.backgroundColor"
              label="Background Color"
              density="compact"
              placeholder="#1E1E1E"
            >
              <template #append>
                <input type="color" v-model="form.style.backgroundColor" style="width: 30px; height: 30px; border: none; cursor: pointer;" />
              </template>
            </v-text-field>

            <v-text-field
              v-model="form.style.valueColor"
              label="Value/Line Color"
              density="compact"
              placeholder="#4CAF50"
            >
              <template #append>
                <input type="color" v-model="form.style.valueColor" style="width: 30px; height: 30px; border: none; cursor: pointer;" />
              </template>
            </v-text-field>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="save" :disabled="!formValid || !form.config.tag">{{ isEditing ? 'Update' : 'Add' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ERCOT_TAGS } from '@/services/dataService'
import type { WidgetType, WidgetStyle } from '@/types/widget'

interface ErcotTag {
  webId: string
  name: string
  path: string
  description: string
  unit: string
  nominal: number
  min: number
  max: number
}

interface WidgetFormConfig {
  tag: string
  durationHours: number
  calculation: string
  label: string
  min: number
  max: number
  unit: string
  decimals: number
}

interface WidgetForm {
  type: WidgetType
  title: string
  config: WidgetFormConfig
  style: WidgetStyle
}

const props = defineProps<{
  modelValue: boolean
  editWidget?: {
    type?: WidgetType
    title?: string
    config?: Partial<WidgetFormConfig>
    style?: Partial<WidgetStyle>
  } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: WidgetForm & { isEditing: boolean }]
}>()

const dialog = ref(false)
const tab = ref('general')
const isEditing = ref(false)
const tagSearch = ref('')
const formRef = ref()
const formValid = ref(false)

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (min: number) => (v: string) => (v && v.length >= min) || `Must be at least ${min} characters`,
  positiveNumber: (v: number) => (v === undefined || v === null || v > 0) || 'Must be a positive number',
  decimals: (v: number) => (v === undefined || v === null || (v >= 0 && v <= 6)) || 'Must be between 0 and 6'
}

const widgetTypes = [
  { label: 'Line Chart', value: 'chart' },
  { label: 'Stacked Area Chart', value: 'stacked' },
  { label: 'Single Value', value: 'value' },
  { label: 'Stat (Grafana-style)', value: 'stat' },
  { label: 'Gauge', value: 'gauge' },
  { label: 'Data Table', value: 'table' }
]

const fontSizes = ['0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem', '2rem']

// ERCOT tags for the tag browser
const ercotTags: ErcotTag[] = Object.values(ERCOT_TAGS).map((tag) => ({
  webId: tag.webId,
  name: tag.name,
  path: `\\\\ERCOT\\${tag.webId.replace('ERCOT.', '')}`,
  description: tag.description,
  unit: tag.unit,
  nominal: tag.nominal,
  min: tag.min,
  max: tag.max
}))

const filteredTags = ref<ErcotTag[]>(ercotTags)

const defaultForm = (): WidgetForm => ({
  type: 'chart',
  title: '',
  config: {
    tag: '',
    durationHours: 4,
    calculation: '',
    label: '',
    min: 0,
    max: 100,
    unit: '',
    decimals: 2
  },
  style: {
    titleColor: '',
    titleSize: '1rem',
    backgroundColor: '',
    valueColor: ''
  }
})

const form = reactive<WidgetForm>(defaultForm())

watch(() => props.modelValue, (val) => {
  dialog.value = val
  if (val) {
    tab.value = 'general'
    if (props.editWidget) {
      isEditing.value = true
      Object.assign(form, {
        type: props.editWidget.type || 'chart',
        title: props.editWidget.title || '',
        config: { ...defaultForm().config, ...props.editWidget.config },
        style: { ...defaultForm().style, ...props.editWidget.style }
      })
    } else {
      isEditing.value = false
      Object.assign(form, defaultForm())
    }
    // Validate form after populating
    setTimeout(() => formRef.value?.validate(), 100)
  }
})

watch(dialog, (val) => {
  emit('update:modelValue', val)
})

function searchTags() {
  const q = tagSearch.value?.toLowerCase() || ''
  filteredTags.value = ercotTags.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.path.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q)
  )
}

function selectTag(tag: ErcotTag) {
  form.config.tag = tag.webId
  if (!form.title) {
    form.title = tag.name
  }
  // Auto-populate unit and min/max for gauges
  if (tag.unit) {
    form.config.unit = tag.unit
  }
  if (tag.min !== undefined) {
    form.config.min = tag.min
  }
  if (tag.max !== undefined) {
    form.config.max = tag.max
  }
}

function close() {
  dialog.value = false
}

function save() {
  emit('save', { ...form, isEditing: isEditing.value })
  dialog.value = false
}
</script>
