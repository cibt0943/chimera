## Chimera is a service with five functions

Chimera is the development code and the service name is 「Kobushi」.

### Link to product

This product can be used on [Kobushi](https://kobushi.fly.dev).

### Todo

- [x] ↑↓ キーで選択行を移動
- [x] Option + ↑↓ キーで選択行の表示順移動
- [x] return キーで選択行を編集
- [x] Option + return キーで選択行の状態を完了
- [x] Option + delete キーで選択行を削除

### Memo

使い方として終わったものはタグをつけてアーカイブしておく。<br>
日々確認したり見たりしているファイルのも一覧い置いておく。<br>
必要になった時にアーカイブ済みのファイルからタグを元に検索して取り出す。

- [x] ↑↓ キーでフォーカス行を移動
- [x] Option + ↑↓ キーで選択行の表示順移動
- [x] return キーで選択行を編集
- [x] Option + return キーで選択行をアーカイブ
- [x] Option + delete キーで選択行を削除
- [x] Option + ← キーでメモ一覧へフォーカス移動
- [x] Option + → キーでメモ詳細のテキストエリアへフォーカス移動
- [ ] メモには日付情報を持つ。デフォルトは作成日で変更可能
- [ ] 日付情報で、カレンダーに表示
- [ ] パブリック URL を作成したメモはログインしないで共同編集可能（リアルタイム編集にしようかな）
- [ ] Undo Redo

### Event

- [x] カレンダーへ イベントの追加、編集、削除が行える
- [x] カレンダーから Todo の参照、追加、編集、削除が行える
- [x] カレンダーから Memo の参照、追加、編集、削除が行える

### File

Linux コマンド操作を主としたファイラー機能にしようかと思っています

### Reminder

Push 通知を受け取るためだけのモバイルアプリを作ってみようかな

### Account

アカウント管理およびに認証、認可には Auth0 を利用しています。

- [x] サインアップ、サインイン、サインアウト
- [x] ダークモード
- [x] 多言語対応
- [ ] タイムゾーン対応
- [x] パスワード再設定
- [ ] メールアドレス変更
