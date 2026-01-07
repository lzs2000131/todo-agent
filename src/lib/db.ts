import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function initDatabase() {
  if (db) {
    console.log('数据库已初始化，直接返回')
    return db
  }

  try {
    console.log('正在加载数据库...')
    db = await Database.load('sqlite:todos.db')
    console.log('数据库加载成功')

    // 创建待办表
    console.log('创建待办表...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        category_id TEXT,
        tags TEXT,
        due_date TEXT,
        reminder TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 创建分类表
    console.log('创建分类表...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT
      )
    `)

    // 创建设置表
    console.log('创建设置表...')
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)

    // 插入默认分类
    console.log('检查默认分类...')
    try {
      const result = await db.select<Array<Record<string, any>>>('SELECT COUNT(*) as count FROM categories')
      console.log('分类查询结果:', result)

      const count = result && result.length > 0 ? (result[0]['COUNT(*)'] || result[0].count || 0) : 0
      console.log('现有分类数量:', count)

      if (count === 0) {
        console.log('插入默认分类...')
        const defaultCategories = [
          { id: '1', name: '工作', color: '#6366F1', icon: '📁' },
          { id: '2', name: '生活', color: '#10B981', icon: '📁' },
          { id: '3', name: '学习', color: '#F59E0B', icon: '📁' },
        ]

        for (const cat of defaultCategories) {
          await db.execute(
            'INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)',
            [cat.id, cat.name, cat.color, cat.icon]
          )
        }
        console.log('默认分类插入完成')
      }
    } catch (error) {
      console.error('处理默认分类时出错:', error)
      // 不抛出错误，允许应用继续运行
    }

    console.log('数据库初始化完成')
    return db
  } catch (error) {
    console.error('数据库初始化失败:', error)
    db = null
    throw error
  }
}

export async function getDatabase() {
  if (!db) {
    await initDatabase()
  }
  return db!
}
