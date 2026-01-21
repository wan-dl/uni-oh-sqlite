import Foundation
import SQLite3

private let SQLITE_TRANSIENT = unsafeBitCast(-1, to: sqlite3_destructor_type.self)

@objc(OhSqliteHelper)
@objcMembers
public class OhSqliteHelper: NSObject {

    private static var databases: [String: OpaquePointer] = [:]

    private static func getDatabasePath(_ name: String) -> String {
        let homeDir = NSHomeDirectory()
        let dbName = name.hasSuffix(".db") ? name : "\(name).db"
        return "\(homeDir)/Documents/\(dbName)"
    }

    @objc public static func openDb(_ name: String) -> Bool {
        if databases[name] != nil {
            return true
        }

        let path = getDatabasePath(name)
        var db: OpaquePointer?

        if sqlite3_open(path, &db) == SQLITE_OK, let database = db {
            databases[name] = database
            print("OhSqlite openDb success: \(name)")
            return true
        } else {
            if db != nil { sqlite3_close(db) }
            return false
        }
    }

    @objc public static func closeDb(_ name: String) -> Bool {
        guard let db = databases[name] else { return true }
        if sqlite3_close(db) == SQLITE_OK {
            databases.removeValue(forKey: name)
            return true
        }
        return false
    }

    @objc public static func checkOpen(_ name: String) -> Bool {
        return databases[name] != nil
    }

    @objc public static func execSql(_ name: String, _ sql: String, _ argsJson: String) -> String {
        guard let db = databases[name] else {
            return "{\"success\":false,\"rowsAffected\":0,\"error\":\"Database not opened\"}"
        }

        var stmt: OpaquePointer?
        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) != SQLITE_OK {
            let err = String(cString: sqlite3_errmsg(db))
            return "{\"success\":false,\"rowsAffected\":0,\"error\":\"\(escapeJson(err))\"}"
        }

        // 解析并绑定参数
        let args = parseArgs(argsJson)
        for (i, arg) in args.enumerated() {
            sqlite3_bind_text(stmt, Int32(i + 1), (arg as NSString).utf8String, -1, SQLITE_TRANSIENT)
        }

        if sqlite3_step(stmt) == SQLITE_DONE {
            let changes = sqlite3_changes(db)
            sqlite3_finalize(stmt)
            return "{\"success\":true,\"rowsAffected\":\(changes)}"
        } else {
            let err = String(cString: sqlite3_errmsg(db))
            sqlite3_finalize(stmt)
            return "{\"success\":false,\"rowsAffected\":0,\"error\":\"\(escapeJson(err))\"}"
        }
    }

    @objc public static func querySql(_ name: String, _ sql: String, _ argsJson: String) -> String {
        guard let db = databases[name] else {
            return "{\"success\":false,\"data\":[],\"error\":\"Database not opened\"}"
        }

        var stmt: OpaquePointer?
        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) != SQLITE_OK {
            let err = String(cString: sqlite3_errmsg(db))
            return "{\"success\":false,\"data\":[],\"error\":\"\(escapeJson(err))\"}"
        }

        let args = parseArgs(argsJson)
        for (i, arg) in args.enumerated() {
            sqlite3_bind_text(stmt, Int32(i + 1), (arg as NSString).utf8String, -1, SQLITE_TRANSIENT)
        }

        var rows: [String] = []
        let colCount = sqlite3_column_count(stmt)

        while sqlite3_step(stmt) == SQLITE_ROW {
            var fields: [String] = []
            for i in 0..<colCount {
                let colName = String(cString: sqlite3_column_name(stmt, i))
                let colType = sqlite3_column_type(stmt, i)

                var val: String
                switch colType {
                case SQLITE_INTEGER:
                    val = "\"\(escapeJson(colName))\":\(sqlite3_column_int64(stmt, i))"
                case SQLITE_FLOAT:
                    val = "\"\(escapeJson(colName))\":\(sqlite3_column_double(stmt, i))"
                case SQLITE_TEXT:
                    if let txt = sqlite3_column_text(stmt, i) {
                        val = "\"\(escapeJson(colName))\":\"\(escapeJson(String(cString: txt)))\""
                    } else {
                        val = "\"\(escapeJson(colName))\":null"
                    }
                default:
                    val = "\"\(escapeJson(colName))\":null"
                }
                fields.append(val)
            }
            rows.append("{\(fields.joined(separator: ","))}")
        }

        sqlite3_finalize(stmt)
        return "{\"success\":true,\"data\":[\(rows.joined(separator: ","))]}"
    }

    private static func parseArgs(_ json: String) -> [String] {
        guard !json.isEmpty, let data = json.data(using: .utf8),
              let arr = try? JSONSerialization.jsonObject(with: data) as? [Any] else {
            return []
        }
        return arr.map { "\($0)" }
    }

    private static func escapeJson(_ s: String) -> String {
        return s.replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "\"", with: "\\\"")
                .replacingOccurrences(of: "\n", with: "\\n")
                .replacingOccurrences(of: "\r", with: "\\r")
                .replacingOccurrences(of: "\t", with: "\\t")
    }
}
