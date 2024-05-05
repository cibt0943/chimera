# Kobushi is a Service with 5 functions

We assume the following 5 functions.

## Todo

- [ ] 選択行をキーボードで移動
- [ ] Enter キーで選択行の編集画面
- [ ] Delete キーで削除画面
- [ ] option + 矢印キーで表示順移動
- [ ] i18n: cloudflare を考えると remix-i18next は使えない
- [ ] ORM: prisma だとリアルタイム更新には対応できない

## Memo

- メモには日付情報を持つ。デフォルトは作成日で変更可能
- 日付情報で、カレンダーに表示
- パブリック URL を作成したメモはログインしないで共同編集可能

## Event

- カレンダーに Todo を表示
- カレンダーに Memo を表示
- カレンダーから Todo を作成

## File

何作るか決めてない  
ストレージ機能は作らない

## Reminder

携帯に Push 通知
