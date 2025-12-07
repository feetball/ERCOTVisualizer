<template>
  <v-container fluid class="pa-0 help-container">
    <v-app-bar color="surface" density="compact" :height="45">
      <v-toolbar-title class="text-body-1 font-weight-medium">Help & Documentation</v-toolbar-title>
    </v-app-bar>

    <v-container class="help-content pa-6">
      <v-row>
        <v-col cols="12" lg="8" offset-lg="2">
          <!-- Getting Started -->
          <v-card class="mb-6">
            <v-card-title class="bg-primary">
              <v-icon class="mr-2">mdi-rocket-launch</v-icon>
              Getting Started
            </v-card-title>
            <v-card-text class="pa-4">
              <p class="text-body-1 mb-3">
                Welcome to ERCOT Grid Visualizer! This application provides real-time monitoring 
                of the Electric Reliability Council of Texas (ERCOT) grid operations.
              </p>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-chart-line">
                  <v-list-item-title><strong>Grid Summary</strong></v-list-item-title>
                  <v-list-item-subtitle>View live grid metrics, generation mix, and system demand</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-monitor">
                  <v-list-item-title><strong>Large Display</strong></v-list-item-title>
                  <v-list-item-subtitle>Full-screen view optimized for large monitors and displays</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-view-dashboard">
                  <v-list-item-title><strong>My Views</strong></v-list-item-title>
                  <v-list-item-subtitle>Create and manage custom dashboard layouts</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Creating and Editing Views -->
          <v-card class="mb-6">
            <v-card-title class="bg-primary">
              <v-icon class="mr-2">mdi-pencil</v-icon>
              Creating and Editing Views
            </v-card-title>
            <v-card-text class="pa-4">
              <h3 class="text-h6 mb-3">1. Enter Edit Mode</h3>
              <p class="mb-4">
                Click the <v-chip size="small" color="primary" class="mx-1">Edit</v-chip> button in the top toolbar 
                to enable editing. In edit mode, you can:
              </p>
              <v-list density="compact" class="mb-4">
                <v-list-item prepend-icon="mdi-drag">Drag widgets to reposition them</v-list-item>
                <v-list-item prepend-icon="mdi-resize">Resize widgets by dragging corners</v-list-item>
                <v-list-item prepend-icon="mdi-pencil">Edit widget settings</v-list-item>
                <v-list-item prepend-icon="mdi-delete">Remove unwanted widgets</v-list-item>
              </v-list>

              <h3 class="text-h6 mb-3">2. Add Widgets</h3>
              <p class="mb-3">
                While in edit mode, click <v-chip size="small" color="primary" class="mx-1">+ Add Widget</v-chip> 
                to add new visualizations:
              </p>
              <v-list density="compact" class="mb-4">
                <v-list-item prepend-icon="mdi-chart-line">
                  <v-list-item-title><strong>Chart</strong></v-list-item-title>
                  <v-list-item-subtitle>Time series line chart for trend analysis</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-poll">
                  <v-list-item-title><strong>Stat</strong></v-list-item-title>
                  <v-list-item-subtitle>Grafana-style stat with sparkline and trend indicator</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-gauge">
                  <v-list-item-title><strong>Gauge</strong></v-list-item-title>
                  <v-list-item-subtitle>Radial gauge for percentage-based metrics</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-numeric">
                  <v-list-item-title><strong>Single Value</strong></v-list-item-title>
                  <v-list-item-subtitle>Display a single current value</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-table">
                  <v-list-item-title><strong>Data Table</strong></v-list-item-title>
                  <v-list-item-subtitle>Tabular data display</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <h3 class="text-h6 mb-3">3. Configure Widgets</h3>
              <p class="mb-3">Each widget has four configuration tabs:</p>
              <v-expansion-panels class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-cog</v-icon>
                    General Settings
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    Set the widget type and title.
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-database</v-icon>
                    Data Source
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    Select ERCOT data tags, set time duration, and configure display options like units and decimal places.
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-function-variant</v-icon>
                    Calculations
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    Apply custom JavaScript calculations to transform data (e.g., unit conversions, formulas).
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-palette</v-icon>
                    Styling
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    Customize colors, fonts, and appearance.
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <h3 class="text-h6 mb-3">4. Save Your Layout</h3>
              <p class="mb-3">
                Click <v-chip size="small" color="primary" class="mx-1">Done</v-chip> when finished editing. 
                Your layout is automatically saved to your browser's local storage.
              </p>

              <h3 class="text-h6 mb-3">5. Create New Views</h3>
              <p class="mb-3">
                Click <v-chip size="small" color="primary" class="mx-1">+ New View</v-chip> in the navigation drawer to create a custom view:
              </p>
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-account">
                  <v-list-item-title><strong>Private View</strong></v-list-item-title>
                  <v-list-item-subtitle>Only visible to you (saved in browser)</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-earth">
                  <v-list-item-title><strong>Public View</strong></v-list-item-title>
                  <v-list-item-subtitle>Share with others via URL</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Available Data -->
          <v-card class="mb-6">
            <v-card-title class="bg-primary">
              <v-icon class="mr-2">mdi-database-outline</v-icon>
              Available ERCOT Data
            </v-card-title>
            <v-card-text class="pa-4">
              <p class="mb-4">
                The following real-time ERCOT grid metrics are available for visualization:
              </p>
              <v-simple-table density="compact">
                <template #default>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Description</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Grid Frequency</strong></td>
                      <td>Current grid frequency</td>
                      <td>Hz</td>
                    </tr>
                    <tr>
                      <td><strong>System Demand</strong></td>
                      <td>Total system load</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Wind Generation</strong></td>
                      <td>Wind power output</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Solar Generation</strong></td>
                      <td>Solar power output</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Natural Gas</strong></td>
                      <td>Gas generation</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Nuclear</strong></td>
                      <td>Nuclear generation</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Coal</strong></td>
                      <td>Coal generation</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Battery Storage</strong></td>
                      <td>Net storage output/input</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Operating Reserves</strong></td>
                      <td>Available spinning reserves</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Available Capacity</strong></td>
                      <td>Total available capacity</td>
                      <td>MW</td>
                    </tr>
                    <tr>
                      <td><strong>Real-Time Price</strong></td>
                      <td>Hub average price</td>
                      <td>$/MWh</td>
                    </tr>
                    <tr>
                      <td><strong>Outages</strong></td>
                      <td>Total forced outages</td>
                      <td>MW</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <!-- Tips & Best Practices -->
          <v-card class="mb-6">
            <v-card-title class="bg-primary">
              <v-icon class="mr-2">mdi-lightbulb-on</v-icon>
              Tips & Best Practices
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-responsive">
                  <v-list-item-title><strong>Responsive Design</strong></v-list-item-title>
                  <v-list-item-subtitle>The dashboard adapts to mobile, tablet, desktop, and large displays</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-refresh">
                  <v-list-item-title><strong>Auto-Refresh</strong></v-list-item-title>
                  <v-list-item-subtitle>Data automatically refreshes every 5-10 seconds</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-theme-light-dark">
                  <v-list-item-title><strong>Dark/Light Theme</strong></v-list-item-title>
                  <v-list-item-subtitle>Toggle theme using the icon in the top-right corner</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-backup-restore">
                  <v-list-item-title><strong>Reset Layout</strong></v-list-item-title>
                  <v-list-item-subtitle>Use the Reset button in edit mode to restore default layout</v-list-item-subtitle>
                </v-list-item>
                <v-list-item prepend-icon="mdi-fullscreen">
                  <v-list-item-title><strong>Full Screen Mode</strong></v-list-item-title>
                  <v-list-item-subtitle>Use browser's fullscreen (F11) for kiosk or large display mode</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Keyboard Shortcuts -->
          <v-card class="mb-6">
            <v-card-title class="bg-primary">
              <v-icon class="mr-2">mdi-keyboard</v-icon>
              Keyboard Shortcuts
            </v-card-title>
            <v-card-text class="pa-4">
              <v-simple-table density="compact">
                <template #default>
                  <thead>
                    <tr>
                      <th>Shortcut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><kbd>E</kbd></td>
                      <td>Toggle edit mode</td>
                    </tr>
                    <tr>
                      <td><kbd>F11</kbd></td>
                      <td>Enter/exit fullscreen</td>
                    </tr>
                    <tr>
                      <td><kbd>Esc</kbd></td>
                      <td>Exit edit mode or close dialogs</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <!-- Support -->
          <v-card>
            <v-card-title class="bg-primary">
              <v-icon class="mr-2">mdi-help-circle</v-icon>
              Need More Help?
            </v-card-title>
            <v-card-text class="pa-4">
              <p class="text-body-1">
                For additional support or to report issues, visit the project repository:
              </p>
              <v-btn
                href="https://github.com/feetball/ERCOTVisualizer"
                target="_blank"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-github"
                class="mt-3"
              >
                GitHub Repository
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
// Help view - no script logic needed
</script>

<style scoped>
.help-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.help-content {
  flex: 1;
  overflow-y: auto;
}

kbd {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.2);
  color: #333;
  display: inline-block;
  font-family: monospace;
  font-size: 0.85em;
  padding: 2px 6px;
  white-space: nowrap;
}

.v-theme--dark kbd {
  background-color: #424242;
  border-color: #616161;
  color: #fff;
}
</style>
