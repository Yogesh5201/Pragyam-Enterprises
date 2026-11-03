#!/bin/bash
# ==============================================================================
# PRAGYAM ENTERPRISES - AUTOMATED DATABASE BACKUP SCRIPT
# ==============================================================================

BACKUP_DIR="/var/backups/pragyam"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/pragyam_db_${DATE}.sql.gz"

mkdir -p ${BACKUP_DIR}

echo "Starting automated PostgreSQL backup for Pragyam Enterprises..."
docker exec pragyam-postgres pg_dump -U pragyam_user -d pragyam_brokerage_db | gzip > ${BACKUP_FILE}

echo "Backup created: ${BACKUP_FILE} ($(du -h ${BACKUP_FILE} | cut -f1))"

# Keep last 30 daily backups
find ${BACKUP_DIR} -name "pragyam_db_*.sql.gz" -mtime +30 -exec rm {} \;
echo "Pruned backups older than 30 days."
