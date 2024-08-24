<script setup>
import { supabase } from './supabase';

const getTasks = async () => {
  let {
    data: todos,
    error,
    status,
  } = await supabase.from('todos').select('task');

  console.log(todos);
  console.log(error);
  console.log(status);
};

getTasks();
</script>

<template>
  <div id="app">
    <h1>Vue3でsupabase</h1>
    <router-view/>
  </div>
</template>

<style scoped>
</style>
