<template>
    <div
        class="h-screen bg-gradient-to-t from-indigo-500 via-teal-500 to-cyan-400 flex flex-col justify-between text-white">
        <div class="container mx-auto py-10">
            <h1 class="text-4xl font-bold text-center mb-10">GitHub リポジトリ検索</h1>

            <!-- 検索フォーム -->
            <div class="flex justify-center gap-4 mb-6">
                <input v-model="title" type="text" placeholder="リポジトリ名 (例: vue)"
                    class="p-2 rounded bg-white text-black" />
                <input v-model="language" type="text" placeholder="言語 (例: javascript)"
                    class="p-2 rounded bg-white text-black" />
                <button @click="searchRepos(1)" class="bg-stone-500 text-white px-4 py-2 rounded hover:bg-rose-600">
                    検索
                </button>
            </div>

            <!-- エラーメッセージ -->
            <div v-if="errorMessage" class="text-center text-red-400 mb-4">
                {{ errorMessage }}
            </div>

            <!-- 検索結果リスト -->
            <ul class="space-y-4">
                <li v-for="repo in repos" :key="repo.id" class="bg-white text-black p-4 rounded shadow hover:shadow-lg">
                    <a :href="repo.html_url" target="_blank" class="text-blue-600 font-semibold">
                        {{ repo.full_name }}
                    </a>
                    <div>
                        ⭐ {{ repo.stargazers_count }} | 🍴 {{ repo.forks_count }}
                    </div>
                </li>
            </ul>

            <!-- ページネーション -->
            <div v-if="repos.length > 0" class="flex justify-center gap-4 mt-6">
                <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)"
                    class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200">
                    前へ
                </button>
                <span class="font-bold">ページ {{ currentPage }}</span>
                <button @click="changePage(currentPage + 1)"
                    class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                    次へ
                </button>
            </div>
        </div>
        <!-- フッター -->
        <footer class="text-center py-4 text-sm">
            ©︎Lull.2025
        </footer>
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

// 現在のページ番号
const currentPage = ref(1)

// 1ページあたりの表示件数
const itemsPerPage = 30

// 検索ボタンが押されたときの処理
const searchRepos = async (page = 1) => {
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

        const url = `https://api.github.com/search/repositories?q=${q}&per_page=${itemsPerPage}&page=${page}`
        const res = await axios.get(url)
        repos.value = res.data.items

        // 現在のページ番号を更新
        currentPage.value = page
    } catch (error) {
        console.error(error)
        errorMessage.value = '検索中にエラーが発生しました。時間をおいて再試行してください。'
    }
}

// ページを変更する処理
const changePage = (page) => {
    searchRepos(page)
}
</script>