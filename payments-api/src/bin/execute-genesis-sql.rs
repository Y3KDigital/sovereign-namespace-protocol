use rusqlite::{Connection, Result};
use std::fs;

fn main() -> Result<()> {
    let db_path = "payments.db";
    let sql_file = "genesis-population.sql";

    println!("\n=== EXECUTING GENESIS DATABASE POPULATION ===");
    println!("Database: {}", db_path);
    println!("SQL File: {}\n", sql_file);

    // Open database connection
    let conn = Connection::open(db_path)?;

    // Read SQL file
    let sql = fs::read_to_string(sql_file)
        .expect("Failed to read SQL file");

    println!("Executing SQL (955 inserts)...");

    // Execute the SQL
    conn.execute_batch(&sql)?;

    println!("✅ SQL executed successfully\n");

    // Verify counts
    println!("=== VERIFICATION ===");

    let total: i32 = conn.query_row(
        "SELECT COUNT(*) FROM available_namespaces",
        [],
        |row| row.get(0),
    )?;

    let available: i32 = conn.query_row(
        "SELECT COUNT(*) FROM available_namespaces WHERE status='available'",
        [],
        |row| row.get(0),
    )?;

    let reserved: i32 = conn.query_row(
        "SELECT COUNT(*) FROM available_namespaces WHERE status='reserved'",
        [],
        |row| row.get(0),
    )?;

    println!("Total rows: {}", total);
    println!("Available (public mint): {}", available);
    println!("Reserved (protocol): {}", reserved);

    if total == 955 {
        println!("\n✅ DATABASE POPULATION COMPLETE");
        println!("✅ READY FOR FRIENDS & FAMILY LAUNCH\n");
        Ok(())
    } else {
        println!("\n❌ ERROR: Expected 955 rows, got {}", total);
        println!("❌ DATABASE IS NOT READY\n");
        std::process::exit(1);
    }
}
