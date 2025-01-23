<template>
    <div
        class="min-h-screen bg-gradient-to-t from-indigo-500 via-teal-500 to-cyan-400 flex flex-col justify-between text-white">
        <div class="container mx-auto px-4 py-10">
            <h1 class="text-3xl sm:text-4xl font-bold text-center mb-6">GitHub リポジトリ検索</h1>

            <!-- 検索フォーム -->
            <div class="flex flex-wrap justify-center gap-6 mb-8">
                <input v-model="title" type="text" placeholder="リポジトリ名 (例: vue)"
                    class="w-full sm:w-auto p-4 rounded bg-white text-black" @keyup.enter="searchRepos(1)" />
                <input v-model="language" type="text" placeholder="言語 (例: javascript)"
                    class="w-full sm:w-auto p-4 rounded bg-white text-black" @keyup.enter="searchRepos(1)" />
                <input v-model="username" type="text" placeholder="ユーザー名 (例: torvalds)"
                    class="w-full sm:w-auto p-4 rounded bg-white text-black" @keyup.enter="searchRepos(1)" />
                <button @click="searchRepos(1)"
                    class="w-full sm:w-auto bg-stone-500 text-white px-6 py-3 rounded hover:bg-rose-600">
                    検索
                </button>
            </div>

            <!-- ソートボタンと表示件数選択 -->
            <div class="flex justify-center items-center mb-6">
                <!-- 中央: ソートボタン -->
                <div class="flex gap-2">
                    <NButton size="large" variant="solid" @click="sortByStars"
                        :class="{ 'bg-purple-300 text-white': isSortedByStars, 'bg-white text-black hover:bg-purple-500': !isSortedByStars }">
                        <span class="material-icons">star</span> 星の数
                    </NButton>
                    <NButton size="large" variant="solid" @click="sortByForks"
                        :class="{ 'bg-purple-300 text-white': isSortedByForks, 'bg-white text-black hover:bg-purple-500': !isSortedByForks }">
                        <span class="material-icons">call_split</span> フォーク数
                    </NButton>
                    <NButton size="large" variant="solid" @click="sortByCreatedDate"
                        :class="{ 'bg-purple-300 text-white': isSortedByCreatedDate, 'bg-white text-black hover:bg-purple-500': !isSortedByCreatedDate }">
                        <span class="material-icons">calendar_today</span> 作成日
                    </NButton>
                    <NButton size="large" variant="solid" class="hover:shadow-lg"
                        :class="{ 'bg-purple-300 text-white': isSortedByOpenIssues, 'bg-white text-black hover:bg-purple-500': !isSortedByOpenIssues }"
                        @click="sortByOpenIssues">
                        <span class="material-icons text-xl">code_off</span>
                        Open Issue数
                    </NButton>

                    <NButton size="large" variant="solid" class="hover:shadow-lg"
                        :class="{ 'bg-purple-300 text-white': isSortedByTotalIssues, 'bg-white text-black hover:bg-purple-500': !isSortedByTotalIssues }"
                        @click="sortByTotalIssues">
                        <span class="material-icons text-xl">code</span>
                        Total Issue数
                    </NButton>

                    <NButton size="large" variant="solid" class="hover:shadow-lg"
                        :class="{ 'bg-purple-300 text-white': isSortedByUpdatedDate, 'bg-white text-black hover:bg-purple-500': !isSortedByUpdatedDate }"
                        @click="sortByUpdatedDate">
                        <span class="material-icons text-xl">update</span>
                        更新日順
                    </NButton>
                    <NButton size="large" variant="solid" color="purple" @click="toggleOrder">
                        <span class="material-icons">{{ isAscending ? 'arrow_upward' : 'arrow_downward' }}</span>
                        {{ isAscending ? '昇順' : '降順' }}
                    </NButton>
                    <NButton size="large" variant="solid" @click="resetToDefault" class="mr-4"
                        :class="{ 'bg-purple-300 text-white': isDefaultOrder, 'bg-white text-black hover:bg-purple-500': !isDefaultOrder }">
                        <span class="material-icons">autorenew</span> デフォルト
                    </NButton>

                    <select id="itemsPerPage" v-model="itemsPerPage" @change="searchRepos(1)"
                        class="p-2 rounded bg-white text-black border border-gray-300 ml-4">
                        <option value="20">20件</option>
                        <option value="50">50件</option>
                        <option value="100">100件</option>
                        <option value="200">200件</option>
                    </select>
                </div>
            </div>

            <!-- 並び替え状態の表示 -->
            <p v-if="isSortedByStars" class="text-center text-sm mt-2">
                現在、⭐ 星の数{{ isAscending ? '昇順' : '降順' }}で表示中です。
            </p>
            <p v-if="isSortedByForks" class="text-center text-sm mt-2">
                現在、🍴 フォーク数{{ isAscending ? '昇順' : '降順' }}で表示中です。
            </p>
            <p v-if="isSortedByCreatedDate" class="text-center text-sm mt-2">
                現在、📅 作成日{{ isAscending ? '昇順' : '降順' }}で表示中です。
            </p>
            <p v-if="isSortedByOpenIssues" class="text-center text-sm mt-2">
                現在、🐛 Open Issue数{{ isAscending ? '昇順' : '降順' }}で表示中です。
            </p>
            <p v-if="isSortedByTotalIssues" class="text-center text-sm mt-2">
                現在、🐛 Total Issue数{{ isAscending ? '昇順' : '降順' }}で表示中です。
            </p>
            <p v-if="isSortedByUpdatedDate" class="text-center text-sm mt-2">
                現在、🔄 更新日順{{ isAscending ? '昇順' : '降順' }}で表示中です。
            </p>
            <p v-if="isDefaultOrder" class="text-center text-sm mt-2">
                現在、 デフォルト順で表示中です。
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
                        ⭐ {{ repo.stargazers_count }} | 🍴 {{ repo.forks_count }} | 🐛 Open Issue数: {{
                        repo.open_issues_count }} | 📅 更新日:
                        {{ new Date(repo.updated_at).toLocaleDateString() }}
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
import { NButton } from 'naive-ui'
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
const itemsPerPage = ref(20)

// 検索結果の総件数
const totalCount = ref(0)

// 並び替えフラグ
const isSortedByStars = ref(false)
const isSortedByForks = ref(false)
const isSortedByCreatedDate = ref(false)
const isSortedByOpenIssues = ref(false)
const isSortedByTotalIssues = ref(false)
const isSortedByUpdatedDate = ref(false)
const isDefaultOrder = ref(true)
const isAscending = ref(false) // 昇順か降順か

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
    isSortedByOpenIssues.value = false
    isSortedByTotalIssues.value = false
    isSortedByUpdatedDate.value = false
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
    repos.value.sort((a, b) =>
        isAscending.value
            ? a.stargazers_count - b.stargazers_count
            : b.stargazers_count - a.stargazers_count
    )
    isSortedByStars.value = true
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isSortedByOpenIssues.value = false
    isSortedByTotalIssues.value = false
    isSortedByUpdatedDate.value = false
    isDefaultOrder.value = false
}

const sortByForks = () => {
    repos.value.sort((a, b) =>
        isAscending.value ? a.forks_count - b.forks_count : b.forks_count - a.forks_count
    )
    isSortedByForks.value = true
    isSortedByStars.value = false
    isSortedByCreatedDate.value = false
    isSortedByOpenIssues.value = false
    isSortedByTotalIssues.value = false
    isSortedByUpdatedDate.value = false
    isDefaultOrder.value = false
}

const sortByCreatedDate = () => {
    repos.value.sort((a, b) =>
        isAscending.value
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at)
    )
    isSortedByCreatedDate.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByOpenIssues.value = false
    isSortedByTotalIssues.value = false
    isSortedByUpdatedDate.value = false
    isDefaultOrder.value = false
}

const sortByOpenIssues = () => {
    repos.value.sort((a, b) =>
        isAscending.value
            ? a.open_issues_count - b.open_issues_count
            : b.open_issues_count - a.open_issues_count
    )
    isSortedByOpenIssues.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isSortedByTotalIssues.value = false
    isSortedByUpdatedDate.value = false
    isDefaultOrder.value = false
}

const sortByTotalIssues = () => {
    repos.value.sort((a, b) =>
        isAscending.value
            ? (a.open_issues_count + (a.closed_issues_count || 0)) - (b.open_issues_count + (b.closed_issues_count || 0))
            : (b.open_issues_count + (b.closed_issues_count || 0)) - (a.open_issues_count + (a.closed_issues_count || 0))
    )
    isSortedByTotalIssues.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isSortedByOpenIssues.value = false
    isSortedByUpdatedDate.value = false
    isDefaultOrder.value = false
}

const sortByUpdatedDate = () => {
    repos.value.sort((a, b) =>
        isAscending.value
            ? new Date(a.updated_at) - new Date(b.updated_at)
            : new Date(b.updated_at) - new Date(a.updated_at)
    )
    isSortedByUpdatedDate.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isSortedByOpenIssues.value = false
    isSortedByTotalIssues.value = false
    isDefaultOrder.value = false
}

// 昇順/降順切り替え
const toggleOrder = () => {
    isAscending.value = !isAscending.value
    if (isSortedByStars.value) {
        sortByStars()
    } else if (isSortedByForks.value) {
        sortByForks()
    } else if (isSortedByCreatedDate.value) {
        sortByCreatedDate()
    } else if (isSortedByOpenIssues.value) {
        sortByOpenIssues()
    } else if (isSortedByTotalIssues.value) {
        sortByTotalIssues()
    } else if (isSortedByUpdatedDate.value) {
        sortByUpdatedDate()
    }
}

// デフォルト順に戻す処理
const resetToDefault = () => {
    searchRepos(currentPage.value) // 現在のページを再取得
    isDefaultOrder.value = true
    isSortedByStars.value = false
    isSortedByForks.value = false
    isSortedByCreatedDate.value = false
    isSortedByOpenIssues.value = false
    isSortedByTotalIssues.value = false
    isSortedByUpdatedDate.value = false
    isAscending.value = false // デフォルトは降順
}

// ページ移動処理
const changePage = (page) => {
    searchRepos(page)
}
</script>

<style scoped>
.material-icons {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}
</style>