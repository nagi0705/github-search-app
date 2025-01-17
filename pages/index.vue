<template>
    <div>
        <h1>GitHub リポジトリ検索</h1>

        <!-- 検索フォーム -->
        <div>
            <!-- リポジトリ名用の入力フィールド -->
            <input v-model="title" type="text" placeholder="リポジトリ名 (例: vue)" />

            <!-- 使用言語用の入力フィールド -->
            <input v-model="language" type="text" placeholder="言語 (例: javascript)" />

            <!-- 検索ボタン -->
            <button @click="searchRepos">検索</button>
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

// フォーム入力されたリポジトリ名と使用言語
const title = ref('')
const language = ref('')

// 検索結果を格納する配列
const repos = ref([])

// 「検索」ボタンが押されたときのメソッド
const searchRepos = () => {
    // まだAPI連携はしないので、テストとしてアラートを出す
    alert(`リポジトリ名: ${title.value}, 言語: ${language.value}`)

    // 仮の検索結果を設定 (後でAPIからの実データに差し替え予定)
    repos.value = [
        { id: 1, full_name: 'sample/repo1' },
        { id: 2, full_name: 'sample/repo2' }
    ]
}
</script>