<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router';
    import supabase from '../supabase';
    import draggable from 'vuedraggable';

    const route = useRoute();
    const router = useRouter();
    const roomId = route.params.roomId;
    const userId = route.query.userId;
    const users = ref([]);
    const name = route.query.name;
    const tasks = ref([]);
    const newTask = ref('');
    const error = ref('');

    onMounted(async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, last_login, INorOUT')
            .eq('room_id', roomId)
            .order('id', { ascending: true });
        if (error) { console.error('Error fetching users:', error.message); }
        else { users.value = data; }
    });

    const getUserStyle = (user) => {
        let nameStyle = {};
        if (user.INorOUT) {
            const currentTime = new Date();
            const lastLoginTime = new Date(user.last_login);
            const fifteenMinutesLater = (currentTime - lastLoginTime) >= 15 * 60 * 1000;
            if (fifteenMinutesLater) { nameStyle.opacity = 0.4; }
            if (user.name === name) { nameStyle.color = 'red'; }
            else { nameStyle.color = 'green'; }
        } else {
            nameStyle.color = 'black';
            nameStyle.opacity = 0.4;
        }
        return nameStyle;
    };

    const createTask = () => {
        if (newTask.value.trim()) {
            tasks.value.push
            newTask.value = '';
        }
    };

    const deleteTask = (index) => { tasks.value.splice(index, 1); };

    const toggleTaskColor = (task) => { task.color = task.color === 'blue' ? 'red' : 'blue'; };

    const logout = async () => {
        try {
            const { error: updateError} = await supabase
                .from('users')
                .update({ INorOUT: false})
                .eq('id', userId);
            if (updateError) { throw new Error(updateError.message); }
            router.push('/');
        } catch (err) { console.error('Logout error:', err.message); }
    };
</script>

<template>
    <button @click="logout">ログアウト</button>
    <div class="task-board">
        <div v-for="user in users" :key="user.id" class="User column">
            <div class="Name" v-bind:style="getUserStyle(user)">
                {{ user.name }}
            </div>
            <div class="assignedTasks"></div>
        </div>
        <div class="Priority column">
            <div class="Name">優先順位</div>
            <div class="assignedTasks"></div>
        </div>
        <div class="Tasks column">
            <div class="Name">タスク</div>
            <div class="assignedTasks"></div>
        </div>
    </div>
    <div class="trash" @dragover.prevent @drop="deleteTask">ゴミ箱</div>
    <form @submit.prevent="createTask">
        <input v-model="newTask" placeholder="タスクを入力" required />
        <button type="submit">作成</button>
    </form>
</template>