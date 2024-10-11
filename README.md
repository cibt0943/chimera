## Chimera: A Personal Web Service with Multiple Features

Chimera is the development code name, and the service is officially named 「Kobushi」.

### Product Link

You can access the service here: [Kobushi](https://kobushi.fly.dev)

### Features

#### Todo

- [x] ↑↓ キーで選択行を移動
- [x] (Mac: Option, Win: Alt) + ↑↓ キーで選択行の表示順移動
- [x] return キーで選択行を編集
- [x] (Mac: Option, Win: Alt) + 1〜4 キーで選択行の状態を変更
- [x] (Mac: Option, Win: Alt) + delete キーで選択行を削除
- [x] 期限日情報を持つ。
- [x] 期限日でイベントカレンダーにタスク情報を表示

#### Memo

使い方として終わったものはタグをつけてアーカイブしておく。<br>
日々確認したり見たりしているファイルのも一覧い置いておく。<br>
必要になった時にアーカイブ済みのファイルからタグを元に検索して取り出す。

- [x] ↑↓ キーでフォーカス行を移動
- [x] (Mac: Option, Win: Alt) + ↑↓ キーで選択行の表示順移動
- [x] return キーで選択行を編集
- [x] (Mac: Option, Win: Alt) + return キーで選択行をアーカイブする(アーカイブから戻す)
- [x] (Mac: Option, Win: Alt) + delete キーで選択行を削除
- [x] (Mac: Option, Win: Ctrl) + ← キーでメモ一覧へフォーカス移動
- [x] (Mac: Option, Win: Ctrl) + → キーでメモ詳細のテキストエリアへフォーカス移動
- [x] メモは関連日付情報を持つ。
- [x] 関連日付でイベントカレンダーにメモ情報を表示
- [ ] パブリック URL を作成したメモはログインしないで共同編集可能（リアルタイム編集にしようかな）
- [ ] Undo Redo

#### Event

- [x] カレンダーへ イベントの追加、編集、削除が行える
- [x] カレンダーから Todo の参照、追加、編集、削除が行える
- [x] カレンダーから Memo の参照、追加、編集、削除が行える

#### Daily Note

普通の日記帳
左にカレンダー右にメモ内容を配置して
カレンダーには情報があるかどうかを表示

#### File

Linux コマンド操作を主としたファイラー機能の予定

#### Reminder

モバイル端末で Todo や Event のリマインダ通知を受信できるようにする予定

#### Account

アカウント管理およびに認証、認可には Auth0 を利用しています。

- [x] サインアップ、サインイン、サインアウト
- [x] ダークモード
- [x] 多言語対応
- [ ] タイムゾーン対応
- [x] パスワード再設定
- [ ] メールアドレス変更
