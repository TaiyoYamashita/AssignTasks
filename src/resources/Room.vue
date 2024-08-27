<script setup>
    import { ref, onMounted,onUnmounted } from 'vue'
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

    const getUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, last_action, INorOUT')
            .eq('room_id', roomId)
            .order('id', { ascending: true });
        if (error) { console.error('Error fetching users:', error.message); }
        else { users.value = data; }
    };

    const updateLastAction = async () => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ last_action: new Date() })
                .eq('id', userId);
            if (error) { console.error('Error updating last_action:', error.message); }
        } catch (err) { console.error('Error updating last_action:', err.message); }
    }

    onMounted(() => {
        getUsers();
        window.addEventListener('mousemove', updateLastAction);
        window.addEventListener('keydown', updateLastAction);
        const interval = setInterval(() => { getUsers(); }, 1000);
        onUnmounted(() => {
            clearInterval(interval);
            window.addEventListener('mousemove', updateLastAction);
            window.addEventListener('keydown', updateLastAction);
        });
    });

    const getUserStyle = (user) => {
        let nameStyle = {};
        if (user.INorOUT) {
            const currentTime = new Date();
            const lastLoginTime = new Date(user.last_action);
            const fifteenMinutesLater = (currentTime - lastLoginTime) >= 15 * 60 * 1000;
            if (fifteenMinutesLater) { nameStyle.opacity = 0.3; }
            if (user.name === name) { nameStyle.color = 'red'; }
            else { nameStyle.color = 'green'; }
        } else {
            nameStyle.color = 'black';
            nameStyle.opacity = 0.3;
        }
        return nameStyle;
    };

    const createTask = () => {
        if (newTask.value.trim()) {
            tasks.value.push({ name: newTask.value, progress: TRUE });
            newTask.value = '';
        }
    };

    const deleteTask = (index) => { tasks.value.splice(index, 1); };

    const toggleTaskColor = (task) => { task.progress ? 'blue' : 'red'; };

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
    <header>
        <h1>Assign Tasks</h1>
        <button @click="logout">ログアウト</button>
    </header>
    <div class="task-board d-flex">
        <div v-for="user in users" :key="user.id" class="User column">
            <div class="Name Border">
                <p v-bind:style="getUserStyle(user)">{{ user.name }}</p>
            </div>
            <div class="AssignedTasks Border"></div>
        </div>
        <div class="Priority column">
            <div class="Name Border">実装予定のタスク</div>
            <div class="AssignedTasks Border"></div>
        </div>
        <div class="Tasks column">
            <div class="Name Border">その他のタスク</div>
            <div class="AssignedTasks Border"></div>
        </div>
    </div>
    <div class="mt-4 clearfix">
        <div class="float-start">
            <i class="fa-solid fa-dumpster fa-5x" @dragover.prevent @drop="deleteTask"></i>
            <h5 class="trash">ゴミ箱</h5>
        </div>
        <form class="float-end" @submit.prevent="createTask">
            <input class="inputFields" v-model="newTask" placeholder="タスクを入力" required />
            <button class="createButton" type="submit">作成</button>
        </form>
    </div>
</template>

<style>
    .column {
        width: 120px;
        margin-right: 5px;
    }
    
    .Border {
        border: 1px solid black;
    }

    .Name {
        height: 30px;
    }

    .AssignedTasks {
        height: 200px;
    }

    .Priority {
        margin-left: 120px;
    }

    .float-start {
        position: relative;
    }

    .fa-dumpster {
        margin-left: 20px;
    }

    .trash {
        color: white;
        position: absolute;
        top: 50%;
        left: 37.5%;
        z-index: 1;
    }

    .inputFields {
        width: 350px;
    }

    .createButton {
        margin-left: 5px;
        margin-right: 30px;
    }
</style>