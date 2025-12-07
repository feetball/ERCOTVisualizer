<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary width="260">
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">ERCOT Grid Monitor</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="navigate('/')" link>
          <v-list-item-icon>
            <v-icon>mdi-chart-line</v-icon>
          </v-list-item-icon>
          <v-list-item-title>System Summary</v-list-item-title>
        </v-list-item>

        <v-list-item @click="navigate('/large-display')" link>
          <v-list-item-icon>
            <v-icon>mdi-monitor</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Large Display</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" density="compact" :height="36">
      <v-app-bar-nav-icon @click="drawer = !drawer" size="small" />
      <v-app-bar-title class="text-body-1">ERCOT Grid Monitor</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon size="small" @click="toggleTheme">
        <v-icon size="18">mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'

const theme = useTheme()
const router = useRouter()
const drawer = ref(false)

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

function navigate(path: string) {
  drawer.value = false
  router.push(path)
}
</script>
