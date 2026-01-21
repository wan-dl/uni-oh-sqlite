package uts.sdk.modules.ohSqlite

import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase

object SqliteHelper {

    private val databases = mutableMapOf<String, SQLiteDatabase>()

    /**
     * 获取数据库路径
     */
    fun getDatabasePath(context: Context, name: String): String {
        return context.getDatabasePath("$name.db").absolutePath
    }

    /**
     * 打开数据库
     */
    fun openDatabase(context: Context, name: String): Boolean {
        return try {
            if (databases.containsKey(name)) {
                true
            } else {
                val path = getDatabasePath(context, name)
                val db = SQLiteDatabase.openOrCreateDatabase(path, null)
                databases[name] = db
                true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * 关闭数据库
     */
    fun closeDatabase(name: String): Boolean {
        return try {
            databases[name]?.let {
                it.close()
                databases.remove(name)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * 执行SQL（增删改）
     */
    fun executeSql(name: String, sql: String, args: Array<String>): Map<String, Any?> {
        val result = mutableMapOf<String, Any?>(
            "success" to false,
            "rowsAffected" to 0
        )

        return try {
            val db = databases[name]
            if (db == null) {
                result["error"] = "Database not opened"
                return result
            }

            if (args.isNotEmpty()) {
                db.execSQL(sql, args)
            } else {
                db.execSQL(sql)
            }

            result["success"] = true
            result["rowsAffected"] = 1
            result
        } catch (e: Exception) {
            result["error"] = e.message
            result
        }
    }

    /**
     * 查询SQL
     */
    fun querySql(name: String, sql: String, args: Array<String>?): Map<String, Any?> {
        val result = mutableMapOf<String, Any?>(
            "success" to false,
            "data" to emptyList<Map<String, Any?>>()
        )

        return try {
            val db = databases[name]
            if (db == null) {
                result["error"] = "Database not opened"
                return result
            }

            val cursor = db.rawQuery(sql, args)
            val data = mutableListOf<Map<String, Any?>>()

            if (cursor.moveToFirst()) {
                do {
                    val row = mutableMapOf<String, Any?>()
                    val columnCount = cursor.columnCount
                    for (i in 0 until columnCount) {
                        val columnName = cursor.getColumnName(i)
                        val columnType = cursor.getType(i)

                        row[columnName] = when (columnType) {
                            Cursor.FIELD_TYPE_NULL -> null
                            Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(i)
                            Cursor.FIELD_TYPE_FLOAT -> cursor.getDouble(i)
                            else -> cursor.getString(i)
                        }
                    }
                    data.add(row)
                } while (cursor.moveToNext())
            }
            cursor.close()

            result["success"] = true
            result["data"] = data
            result
        } catch (e: Exception) {
            result["error"] = e.message
            result
        }
    }

    /**
     * 检查数据库是否已打开
     */
    fun isOpen(name: String): Boolean {
        val db = databases[name]
        return db != null && db.isOpen
    }
}
