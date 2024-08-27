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
        const { data, error: supabaseError } = await supabase
            .from('rooms')
            .select('*')
            .order('id', { ascending: true });
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
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ last_action: currentTime, INorOUT: true })
                    .eq('id', userId);
                router.push({
                    path: `/room/${roomId.value}`,
                    query: {
                        userId: data[0].id,
                        name: data[0].name
                    }
                });
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
    <div class="frame">
        <h1>Assign Tasks</h1>
        <h3>ログイン</h3>
        <form class="form" @submit.prevent="login">
            <select v-model="roomId" required>
                <option disabled value="">部屋選択</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                    {{ room.room_name }}
                </option>
            </select>
            <input v-model="name" placeholder="ユーザー名" required />
            <input v-model="password" type="password" placeholder="パスワード" required />
            <button class="loginButton" type="submit">ログイン</button>
        </form>
        <p v-if="error">{{ error }}</p>
        <router-link to="/register">新規ユーザー登録はこちら</router-link>
    </div>
</template>

<style>
    .frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0 auto;
        text-align: center;
    }

    .form {
        width: 100%;
        max-width: 400px;
    }

    .form > * {
        margin-bottom: 15px;
        width: 100%;
    }

    button {
        align-self: center;
    }
</style>