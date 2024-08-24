<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import supabase from '../supabase';

    const rooms = ref([]);
    const roomId = ref('');
    const name = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const errorMessage = ref('');

    const router = useRouter();

    onMounted(async () => {
        const { data, error: supabaseError } =
            await supabase.from('rooms').select('*').order('id', { ascending: true });
        if (supabaseError) {
            console.error('Error fetching rooms:', supabaseError.message);
            error.value = '部屋情報の取得に失敗しました。';
        } else {
            rooms.value = data;
        }
    });

    async function registerAndLogin() {
        if (password.value !== confirmPassword.value) {
            password.value = '';
            confirmPassword.value = '';
            errorMessage.value = 'パスワードが一致しません。';
            return;
        }

        const { data, error } = await supabase.from('users').insert([{
            room_id: roomId.value,
            name: name.value,
            password: password.value,
        }]);

        if (error) {
            console.error('Error registering user:', error.message);
            errorMessage.value = error.message;
        } else {
            console.log('User registered and logged in:', data);
            const { data, error: supabaseError } =
                await supabase.from('users').select('id').order('id', { ascending: false }).limit(1);
            router.push(`/room/${roomId.value}/${data[0].id}`);
        }
    }
</script>

<template>
    <div>
        <h1>新規ユーザー登録</h1>
        <form @submit.prevent="registerAndLogin">
            <select v-model="roomId" required>
                <option disabled value="">部屋を選択してください</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                    {{ room.room_name }}
                </option>
            </select>
            <input v-model="name" placeholder="ユーザー名" required />
            <input v-model="password" type="password" placeholder="パスワード" required />
            <input v-model="confirmPassword" type="password" placeholder="パスワード（確認用）" required />
            <button @click="registerAndLogin">登録してログイン</button>
        </form>
        <p v-if="error">{{ error }}</p>
        <router-link to="/">ログインはこちら</router-link>
    </div>
</template>
