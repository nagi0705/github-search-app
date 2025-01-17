<template>
    <div>
        <h1>GitHub リポジトリ検索</h1>

        <!-- 検索フォーム -->
        <div>
            <input v-model="title" type="text" placeholder="リポジトリ名 (例: vue)" />
            <input v-model="language" type="text" placeholder="言語 (例: javascript)" />
            <button @click="searchRepos">検索</button>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="errorMessage" style="color: red; margin-top: 10px;">
            {{ errorMessage }}
        </div>

        <!-- 検索結果リスト -->
        <ul>
            <li v-for="repo in repos" :key="repo.id">
                {{ repo.full_name }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// フォーム入力されたリポジトリ名と使用言語
const title = ref('')
const language = ref('')

// 検索結果を格納する配列
const repos = ref([])

// エラーメッセージ
const errorMessage = ref('')

// 検索ボタンが押されたときの処理
const searchRepos = async () => {
    // 入力チェック
    if (!title.value && !language.value) {
        errorMessage.value = 'リポジトリ名または言語を入力してください。'
        return
    }

    // エラーがなければメッセージをリセット
    errorMessage.value = ''

    try {
        let q = 'in:name'
        if (title.value) {
            q += `+${title.value}`
        }
        if (language.value) {
            q += `+language:${language.value}`
        }
        q += '+is:public'

        const url = `https://api.github.com/search/repositories?q=${q}`
        const res = await axios.get(url)
        repos.value = res.data.items
    } catch (error) {
        console.error(error)
        errorMessage.value = '検索中にエラーが発生しました。時間をおいて再試行してください。'
    }
}
</script>