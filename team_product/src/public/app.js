/**
 * Base App - クライアント側JavaScript
 *
 * このコードはブラウザ上で動作します。
 * ログはブラウザのF12（開発者ツール）に表示されます。
 *
 * 現在の機能: Create（追加）、Read（一覧表示）
 */

// =====================================================
// DOM要素の取得
// =====================================================
const titleInput = document.getElementById('titleInput')
const addButton = document.getElementById('addButton')
const itemList = document.getElementById('itemList')
const emptyMessage = document.getElementById('emptyMessage')
const deleteButton = document.getElementById('deleteButton')
const deleteSection = document.getElementById('deleteSection')

// =====================================================
// 選択状態の管理
// =====================================================
const selectedItems = new Set() // 選択中のアイテムIDを格納

// ページ読み込み時にログ出力
console.log('[CLIENT] ページが読み込まれました')

// =====================================================
// API呼び出し関数
// =====================================================

/**
 * アイテム一覧を取得して表示
 *
 * IPO:
 * - Input: なし
 * - Process: サーバーからアイテム一覧を取得
 * - Output: 画面にアイテムを表示
 */
/**
 * アイテム一覧を取得して表示
 *
 * @param {string} [search] - 検索文字列（省略時は全件取得）
 */
async function loadItems(search) {
  console.log('[CLIENT] アイテム一覧を取得中...', search ? `(検索: ${search})` : '')

  try {
    // サーバーにリクエスト（この時点でServer層に処理が移る）
    let url = '/api/items'
    if (search && search.trim() !== '') {
      url += '?search=' + encodeURIComponent(search.trim())
    }
    const response = await fetch(url)
    const items = await response.json()

    console.log('[CLIENT] 取得完了:', items.length, '件')

    // 画面を更新
    renderItems(items)
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('アイテムの取得に失敗しました')
  }
}

/**
 * アイテムを追加
 *
 * IPO:
 * - Input: テキストボックスのタイトル
 * - Process: サーバーにPOSTリクエスト → DB保存
 * - Output: 一覧を再読み込み
 */
async function addItem() {
  const title = titleInput.value.trim()

  // 入力チェック（Client側のバリデーション）
  if (!title) {
    alert('タイトルを入力してください')
    return
  }

  console.log('[CLIENT] アイテムを追加:', title)

  try {
    // サーバーにPOSTリクエスト
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    // 入力欄をクリア
    titleInput.value = ''

    // 一覧を再読み込み
    await loadItems()

    console.log('[CLIENT] 追加完了')
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('追加に失敗しました: ' + error.message)
  }
}

// =====================================================
// ここに新しい機能（Delete, Updateなど）を追加していこう！
// =====================================================

/**
 * アイテムを更新
 *
 * IPO:
 * - Input: アイテムIDと新しいタイトル
 * - Process: サーバーにPUTリクエストを送信
 * - Output: 一覧を再読み込みして画面を更新
 */
async function updateItem(id, newTitle) {
  console.log('[CLIENT] アイテムを更新:', id, newTitle)

  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    await loadItems()
    console.log('[CLIENT] 更新完了')
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('更新に失敗しました: ' + error.message)
  }
}

/**
 * 選択したアイテムを削除
 *
 * IPO:
 * - Input: selectedItems セット（選択中のアイテムID）
 * - Process: 各ID毎にサーバーへDELETEリクエストを送信
 * - Output: 削除完了後に一覧を再読み込み
 */
async function deleteSelectedItems() {
  if (selectedItems.size === 0) {
    alert('削除するアイテムを選択してください')
    return
  }

  const confirmMessage = `${selectedItems.size}個のアイテムを削除しますか？`
  if (!confirm(confirmMessage)) {
    return
  }

  console.log('[CLIENT] アイテムを削除:', Array.from(selectedItems))

  try {
    // 各アイテムをDELETE
    for (const id of selectedItems) {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`ID ${id}: ${error.error}`)
      }
    }

    // 削除完了後に選択をクリア
    selectedItems.clear()

    // 一覧を再読み込み
    await loadItems()
    console.log('[CLIENT] 削除完了')
  } catch (error) {
    console.error('[CLIENT] エラー:', error)
    alert('削除に失敗しました: ' + error.message)
  }
}


// =====================================================
// 画面描画関数
// =====================================================

/**
 * アイテム一覧を画面に描画
 */
function renderItems(items) {
  // リストをクリア
  itemList.innerHTML = ''

  // 空メッセージの表示/非表示
  emptyMessage.style.display = items.length === 0 ? 'block' : 'none'

  // 削除ボタンセクションの表示/非表示
  if (deleteSection) {
    deleteSection.style.display = items.length === 0 ? 'none' : 'block'
  }

  // 各アイテムを描画
  items.forEach(item => {
    const li = document.createElement('li')
    li.className = 'item'
    if (selectedItems.has(item.id)) {
      li.classList.add('item-selected')
    }

    // チェックボックス
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'item-checkbox'
    checkbox.checked = selectedItems.has(item.id)
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedItems.add(item.id)
        li.classList.add('item-selected')
      } else {
        selectedItems.delete(item.id)
        li.classList.remove('item-selected')
      }
    })

    const titleSpan = document.createElement('span')
    titleSpan.className = 'item-title'
    titleSpan.textContent = item.title

    const editButton = document.createElement('button')
    editButton.textContent = '編集'
    editButton.className = 'edit-button'
    editButton.addEventListener('click', () => {
      // 編集モードに切り替え
      li.innerHTML = ''
      const input = document.createElement('input')
      input.type = 'text'
      input.value = item.title
      input.className = 'edit-input'

      const doneButton = document.createElement('button')
      doneButton.textContent = '完了'
      doneButton.className = 'done-button'

      // 完了ボタン押下時の処理
      doneButton.addEventListener('click', async () => {
        const trimmed = input.value.trim()
        if (!trimmed) {
          alert('タイトルを空にすることはできません')
          return
        }
        await updateItem(item.id, trimmed)
      })

      li.appendChild(input)
      li.appendChild(doneButton)
      input.focus()
    })

    li.appendChild(checkbox)
    li.appendChild(titleSpan)
    li.appendChild(editButton)
    itemList.appendChild(li)
  })
}

/**
 * HTMLエスケープ（XSS対策）
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// =====================================================
// イベントリスナー
// =====================================================

// 追加ボタンクリック
addButton.addEventListener('click', addItem)

// Enterキーで追加
titleInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addItem()
  }
})

// 検索ボタン
const searchInput = document.getElementById('searchInput')
const searchButton = document.getElementById('searchButton')
const clearSearchButton = document.getElementById('clearSearchButton')

searchButton.addEventListener('click', () => {
  const q = searchInput.value
  loadItems(q)
})

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loadItems(searchInput.value)
  }
})

clearSearchButton.addEventListener('click', () => {
  searchInput.value = ''
  loadItems()
})

// 削除ボタンクリック
if (deleteButton) {
  deleteButton.addEventListener('click', deleteSelectedItems)
}

// =====================================================
// 初期化
// =====================================================

// ページ読み込み時にアイテム一覧を取得
loadItems()
