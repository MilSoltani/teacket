<script setup lang="ts">
import {UserClient} from '@teacket/api/clients'
import { RouterView } from 'vue-router';

UserClient.index.$get()
</script>

<template>
  <RouterView />
</template>
