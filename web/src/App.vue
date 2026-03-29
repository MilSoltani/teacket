<script setup lang="ts">
import Button from '@web/components/ui/button/Button.vue'
import {UserClient} from '@teacket/api/clients'

UserClient.index.$get()
</script>

<template>
  <Button>Hello!</Button>
</template>
