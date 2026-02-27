/**
 * Base App - サーバーメインファイル
 *
 * このファイルはサーバー側の処理を担当します。
 * ログはVSCodeのターミナルに表示されます。
 *
 * 現在の機能: Create（追加）、Read（一覧表示）
 */

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const path = require('path')

const app = express()
const prisma = new PrismaClient()
const PORT = 3000

// ミドルウェア設定
// JSONデータを受け取れるようにする
app.use(express.json())
// 静的ファイル（HTML、CSS、JS）を提供
app.use(express.static(path.join(__dirname, 'public')))

// =====================================================
// API エンドポイント（ここがServer層の処理）
// =====================================================

/**
 * GET /api/items - アイテム一覧取得
 *
 * IPO:
 * - Input: なし（ページ読み込み時に自動で呼ばれる）
 * - Process: DBからアイテムを全件取得
 * - Output: アイテム一覧をJSONで返す
 */
app.get('/api/items', async (req, res) => {
  try {
    // DBからアイテムを取得（新しい順）
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('[SERVER] アイテム一覧を取得:', items.length, '件')
    res.json(items)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    res.status(500).json({ error: 'アイテム取得に失敗しました' })
  }
})

/**
 * POST /api/items - アイテム作成
 *
 * IPO:
 * - Input: クライアントからアイテム名（title）を受け取る
 * - Process: DBに新しいアイテムを保存
 * - Output: 作成したアイテムをJSONで返す
 */
app.post('/api/items', async (req, res) => {
  try {
    const { title } = req.body

    // バリデーション（入力チェック）
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'タイトルを入力してください' })
    }

    // DBにアイテムを保存（永続化！）
    const item = await prisma.item.create({
      data: { title: title.trim() }
    })

    console.log('[SERVER] アイテムを作成:', item)
    res.status(201).json(item)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    res.status(500).json({ error: 'アイテム作成に失敗しました' })
  }
})

// =====================================================
// ここに新しいAPI（Delete, Updateなど）を追加していこう！
// =====================================================

/**
 * PUT /api/items/:id - アイテム更新
 *
 * IPO:
 * - Input: パスパラメーターにID、リクエストボディに新しいタイトル
 * - Process: DBの該当レコードを更新
 * - Output: 更新済みアイテムをJSONで返す
 */
app.put('/api/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { title } = req.body

    // バリデーション
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'タイトルを入力してください' })
    }

    // 更新処理
    const item = await prisma.item.update({
      where: { id },
      data: { title: title.trim() }
    })

    console.log('[SERVER] アイテムを更新:', item)
    res.json(item)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    // 更新対象が見つからない場合はPrismaからエラーが投げられる
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'アイテムが見つかりません' })
    }
    res.status(500).json({ error: 'アイテム更新に失敗しました' })
  }
})

/**
 * DELETE /api/items/:id - アイテム削除
 *
 * IPO:
 * - Input: パスパラメーターにID
 * - Process: DBから該当レコードを削除
 * - Output: 削除したアイテムをJSONで返す
 */
app.delete('/api/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)

    // 削除処理
    const item = await prisma.item.delete({
      where: { id }
    })

    console.log('[SERVER] アイテムを削除:', item)
    res.json(item)
  } catch (error) {
    console.error('[SERVER] エラー:', error)
    // 削除対象が見つからない場合はPrismaからエラーが投げられる
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'アイテムが見つかりません' })
    }
    res.status(500).json({ error: 'アイテム削除に失敗しました' })
  }
})


// =====================================================
// サーバー起動
// =====================================================
app.listen(PORT, () => {
  console.log('='.repeat(50))
  console.log('[SERVER] Base App 起動中')
  console.log(`[SERVER] URL: http://localhost:${PORT}`)
  console.log('='.repeat(50))
})
