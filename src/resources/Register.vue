<template>
    <div>
        <h1>新規ユーザー登録</h1>
        <form @submit.prevent="login">
            <input v-model="room_id" placeholder="部屋" required />
            <input v-model="name" placeholder="ユーザー名" required />
            <input v-model="password" placeholder="パスワード" required />
            <input v-model="confirmPassword" placeholder="パスワード（確認用）" required />
            <button @click="registerAndLogin">Login</button>
        </form>
        <p v-if="error">{{ error }}</p>
        <router-link to="/register">新規ユーザー登録はこちら</router-link>
    </div>
</template>

<script setup>
    import supabase from '../supabase'
    export default {
      data() {
        return {
            name: '',
            roomId: '',
            password: '',
            confirmPassword: '',
            error: ''
        }
    },
    methods: {
        async registerAndLogin() {
            if (this.password !== this.confirmPassword) {
                this.password = '',
                this.confirmPassword = '',
                this.errorMessage = 'パスワードが一致しません。'
            }
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