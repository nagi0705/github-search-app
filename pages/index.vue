<template>
    <div>
        <h1>GitHub リポジトリ検索</h1>

        <!-- 検索フォーム -->
        <div>
            <input v-model="title" type="text" placeholder="リポジトリ名 (例: vue)" />
            <input v-model="language" type="text" placeholder="言語 (例: javascript)" />
            <button @click="searchRepos(1)">検索</button>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="errorMessage" style="color: red; margin-top: 10px;">
            {{ errorMessage }}
        </div>

        <!-- 検索結果リスト -->
        <ul>
            <li v-for="repo in repos" :key="repo.id">
                <a :href="repo.html_url" target="_blank">{{ repo.full_name }}</a>
                <div>
                    ⭐ {{ repo.stargazers_count }} | 🍴 {{ repo.forks_count }}
                </div>
            </li>
        </ul>

        <!-- ページネーション -->
        <div v-if="repos.length > 0" style="margin-top: 20px;">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">前へ</button>
            <span>ページ {{ currentPage }}</span>
            <button @click="changePage(currentPage + 1)">次へ</button>
        </div>

        <!-- フッターに著作権表記を追加 -->
        <footer style="margin-top: 40px; text-align: center; color: gray; font-size: 12px;">
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