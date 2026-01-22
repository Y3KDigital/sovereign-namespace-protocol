import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PaymentDB {
  constructor(dbPath) {
    this.db = new Database(dbPath || join(__dirname, '../genesis-payments.db'));
    this.db.pragma('journal_mode = WAL');
    this.initStatements();
  }

  initStatements() {
    // Prepared statements for performance
    this.statements = {
      createPayment: this.db.prepare(`
        INSERT INTO payments (id, root, asset, expected_usd, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `),
      
      getPendingPayments: this.db.prepare(`
        SELECT * FROM payments
        WHERE status = 'pending'
        AND created_at > ?
        ORDER BY created_at ASC
      `),
      
      updateTransaction: this.db.prepare(`
        UPDATE payments
        SET tx_hash = ?, confirmations = ?, status = ?
        WHERE id = ?
      `),
      
      confirmPayment: this.db.prepare(`
        UPDATE payments
        SET status = 'confirmed', confirmed_at = ?
        WHERE id = ?
      `),
      
      getPaymentById: this.db.prepare(`
        SELECT * FROM payments WHERE id = ?
      `),
      
      getPaymentByRoot: this.db.prepare(`
        SELECT * FROM payments WHERE root = ? AND status != 'pending'
      `),

      updateCertificate: this.db.prepare(`
        UPDATE payments
        SET certificate_ipfs_hash = ?, status = 'complete'
        WHERE id = ?
      `)
    };
  }

  createPayment(id, root, asset, expectedUsd) {
    const now = Math.floor(Date.now() / 1000);
    this.statements.createPayment.run(id, root, asset, expectedUsd, now);
    return this.statements.getPaymentById.get(id);
  }

  getPendingPayments(windowHours = 24) {
    const cutoff = Math.floor(Date.now() / 1000) - (windowHours * 3600);
    return this.statements.getPendingPayments.all(cutoff);
  }

  updateTransaction(id, txHash, confirmations, status = 'pending') {
    this.statements.updateTransaction.run(txHash, confirmations, status, id);
  }

  confirmPayment(id) {
    const now = Math.floor(Date.now() / 1000);
    this.statements.confirmPayment.run(now, id);
  }

  getPaymentById(id) {
    return this.statements.getPaymentById.get(id);
  }

  getPaymentByRoot(root) {
    return this.statements.getPaymentByRoot.get(root);
  }

  updateCertificate(id, ipfsHash) {
    this.statements.updateCertificate.run(ipfsHash, id);
  }

  close() {
    this.db.close();
  }
}

export default PaymentDB;
