<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import supabase from '../supabase';

    const router = useRouter();
    const rooms = ref([]);
    const roomId = ref('');
    const name = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const errorMessage = ref('');

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
            errorMessage.value = 'パスワードと確認用のパスワードが一致しませんでした。';
            return;
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('room_id', roomId.value)
            .eq('name', name.value)
            .single();
        if (existingUser) {
            errorMessage.value = 'この部屋にはすでに同じ名前のユーザーが存在します。'
        } else {
            await supabase.from('users').insert([{
                room_id: roomId.value,
                name: name.value,
                password: password.value,
            }]);
            const { data } = await supabase
                .from('users')
                .select('id, room_id')
                .order('id', { ascending: false}).limit(1);
            router.push({
                path: `/room/${data[0].room_id}`,
                query: {
                    userId: data[0].id,
                    name: name.value
                }
            })
        }
    }
</script>

<template>
    <div class="frame">
        <h1>Assign Tasks</h1>
        <h3>新規ユーザー登録</h3>
        <form class="form" @submit.prevent="registerAndLogin">
            <select v-model="roomId" required>
                <option disabled value="">部屋を選択してください</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                    {{ room.room_name }}
                </option>
            </select>
            <input v-model="name" placeholder="ユーザー名" required />
            <input v-model="password" type="password" placeholder="パスワード" required />
            <input v-model="confirmPassword" type="password" placeholder="パスワード（確認用）" required />
            <button class=" button"@click="registerAndLogin">登録してログイン</button>
        </form>
        <p v-if="errorMessage">{{ errorMessage }}</p>
        <router-link to="/">ログインはこちら</router-link>
    </div>
</template>