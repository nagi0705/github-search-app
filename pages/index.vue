<template>
    <div
        class="min-h-screen bg-gradient-to-t from-indigo-500 via-teal-500 to-cyan-400 flex flex-col justify-between text-white">
        <div class="container mx-auto px-4 py-10">
            <h1 class="text-3xl sm:text-4xl font-bold text-center mb-6">GitHub リポジトリ検索</h1>

            <!-- 検索フォーム -->
            <div class="flex flex-wrap justify-center gap-4 mb-6">
                <input v-model="title" type="text" placeholder="リポジトリ名 (例: vue)"
                    class="w-full sm:w-auto p-2 rounded bg-white text-black" />
                <input v-model="language" type="text" placeholder="言語 (例: javascript)"
                    class="w-full sm:w-auto p-2 rounded bg-white text-black" />
                <input v-model="username" type="text" placeholder="ユーザー名 (例: torvalds)"
                    class="w-full sm:w-auto p-2 rounded bg-white text-black" />
                <button @click="searchRepos(1)"
                    class="w-full sm:w-auto bg-stone-500 text-white px-4 py-2 rounded hover:bg-rose-600">
                    検索
                </button>
            </div>

            <!-- 表示件数選択 -->
            <div class="flex justify-center items-center gap-4 mb-6">
                <label for="itemsPerPage" class="text-sm">1ページ表示件数:</label>
                <select id="itemsPerPage" v-model="itemsPerPage" @change="searchRepos(1)"
                    class="p-2 rounded bg-white text-black">
                    <option value="10">10件</option>
                    <option value="20">20件</option>
                    <option value="30">30件</option>
                    <option value="50">50件</option>
                </select>
            </div>

            <!-- 並べ替えボタン -->
            <div class="flex justify-center items-center gap-4 mb-6">
                <button @click="sortByStars" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                    ⭐ 星の数降順で並べ替え
                </button>
                <button @click="sortByForks" class="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600">
                    🍴 フォーク数降順で並べ替え
                </button>
                <button @click="sortByCreatedDate"
                    class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    📅 作成日降順で並べ替え
                </button>
                <button @click="resetToDefault" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    🔄 デフォルト順に戻す
                </button>
            </div>

            <!-- 並び替え状態の表示 -->
            <p v-if="isSortedByStars" class="text-center text-sm mt-2">
                現在、⭐ 星の数降順で表示中です。
            </p>
            <p v-if="isSortedByForks" class="text-center text-sm mt-2">
                現在、🍴 フォーク数降順で表示中です。
            </p>
            <p v-if="isSortedByCreatedDate" class="text-center text-sm mt-2">
                現在、📅 作成日降順で表示中です。
            </p>
            <p v-if="isDefaultOrder" class="text-center text-sm mt-2">
                現在、🔄 デフォルト順で表示中です。
            </p>

            <!-- ヒット件数表示 -->
            <div v-if="totalCount > 0" class="text-center text-sm text-white mb-4">
                {{ totalCount }}件中 {{ (currentPage - 1) * itemsPerPage + 1 }}〜{{ Math.min(currentPage * itemsPerPage,
                    totalCount) }}件を表示中
            </div>

            <!-- 検索結果リスト -->
            <ul class="space-y-4">
                <li v-for="repo in repos" :key="repo.id" class="bg-white text-black p-4 rounded shadow hover:shadow-lg">
                    <a :href="repo.html_url" target="_blank" class="text-blue-600 font-semibold block">
                        {{ repo.full_name }}
                    </a>
                    <div class="mt-2">
                        ⭐ {{ repo.stargazers_count }} | 🍴 {{ repo.forks_count }} | 📅 作成日:
                        {{ new Date(repo.created_at).toLocaleDateString() }}
                    </div>
                </li>
            </ul>

            <!-- ページネーション -->
            <div v-if="repos.length > 0" class="flex justify-center items-center gap-4 mt-6 flex-wrap">
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

// 検索フォーム入力
const title = ref('')
const language = ref('')
const username = ref('') // ユーザー名検索用

// 検索結果リスト
const repos = ref([])

// エラーメッセージ
const errorMessage = ref('')

// 現在のページ番号
const currentPage = ref(1)

// 1ページあたりの表示件数
const itemsPerPage = ref(30)

// 検索結果の総件数
const totalCount = ref(0)

// 並び替えフラグ
const isSortedByStars = ref(false)
const isSortedByForks = ref(false)
const isSortedByCreatedDate = ref(false)
const isDefaultOrder = ref(true)

// 検索処理
const searchRepos = async (page = 1) => {
    if (!title.value && !language.value && !username.value) {
        errorMessage.value = 'リポジトリ名、言語、またはユーザー名を入力してください。'
        return
    }
    errorMessage.value = ''
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isDefaultOrder.value = true // デフォルト順

    try {
        let q = 'in:name'
        if (title.value) q += `+${title.value}`
        if (language.value) q += `+language:${language.value}`
        if (username.value) q += `+user:${username.value}`

        const url = `https://api.github.com/search/repositories?q=${q}&per_page=${itemsPerPage.value}&page=${page}`
        const res = await axios.get(url)
        repos.value = res.data.items
        totalCount.value = res.data.total_count // 総件数を取得
        currentPage.value = page
    } catch (error) {
        console.error(error)
        errorMessage.value = '検索中にエラーが発生しました。時間をおいて再試行してください。'
    }
}

// 並び替え処理
const sortByStars = () => {
    repos.value.sort((a, b) => b.stargazers_count - a.stargazers_count)
    isSortedByStars.value = true
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isDefaultOrder.value = false
}

const sortByForks = () => {
    repos.value.sort((a, b) => b.forks_count - a.forks_count)
    isSortedByForks.value = true
    isSortedByStars.value = false
    isSortedByCreatedDate.value = false
    isDefaultOrder.value = false
}

const sortByCreatedDate = () => {
    repos.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    isSortedByCreatedDate.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isDefaultOrder.value = false
}

// デフォルト順に戻す処理
const resetToDefault = () => {
    searchRepos(currentPage.value) // 現在のページを再取得
    isDefaultOrder.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
}

// ページ移動処理
const changePage = (page) => {
    searchRepos(page)
}
</script>