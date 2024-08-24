<template>
    <div>
        <h1>新規ユーザー登録</h1>
        <form @submit.prevent="login">
            <input v-model="room_id" placeholder="部屋" required />
            <input v-model="name" placeholder="ユーザー名" required />
            <input v-model="password" type="password" placeholder="パスワード" required />
            <button @click="registerAndLogin">ログイン</button>
        </form>
        <p v-if="error">{{ error }}</p>
        <router-link to="/">ログインはこちら</router-link>
    </div>
</template>

<script setup>
    import supabase from '../supabase'
    export default {
      data() {
        return {
            roomId: '',
            name: '',
            password: '',
            error: ''
        }
    },
    methods: {
        async registerAndLogin() {
            const { data, error } = await supabase.from('users').insert([{
                room_id: this.roomId,
                name: this.name,
                password: this.password,
                last_login: new Date().toISOString()
            }])

            if (error) {
                console.error('Error registering user:', error.message)
            } else {
                console.log('User registered and logged in:', data)
                this.$router.push(`/room/${this.roomId}`)
            }
        }
    }
}
</script>