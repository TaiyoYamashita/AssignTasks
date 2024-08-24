<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import supabase from '../supabase';

    const rooms = ref([]);
    const roomId = ref('');
    const name = ref('');
    const password = ref('');
    const error = ref('');

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

    const login = async () => {
        try {
            const { data, error: supabaseError } = await supabase
                .from('users')
                .select('*')
                .eq('room_id', roomId.value)
                .eq('name', name.value)
                .eq('password', password.value);

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            if (data.length > 0) {
                const userId = data[0].id;
                const currentTime = new Date().toISOString();
                const { error: updateError } =
                    await supabase.from('users').update({ last_login: currentTime, INorOUT: true }).eq('id', userId);
                router.push(`/room/${roomId.value}/${userId}`);
            } else {
                password.value = '';
                error.value = '条件に一致するユーザーが見つかりませんでした。';
            }
        } catch (err) {
            console.error('Login error:', err.message);
            error.value = 'ログインに失敗しました。';
        }
    };
</script>

<template>
    <div>
        <h1>ログイン</h1>
        <form @submit.prevent="login">
            <select v-model="roomId" required>
                <option disabled value="">部屋選択</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                    {{ room.room_name }}
                </option>
            </select>
            <input v-model="name" placeholder="ユーザー名" required />
            <input v-model="password" type="password" placeholder="パスワード" required />
            <button type="submit">ログイン</button>
        </form>
        <p v-if="error">{{ error }}</p>
        <router-link to="/register">新規ユーザー登録はこちら</router-link>
    </div>
</template>
