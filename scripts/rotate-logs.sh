#!/data/data/com.termux/files/usr/bin/bash
# ═══════════════════════════════════════════════════════════
#  ZES System v2 — Log Rotation & Archival
#  Archives logs older than N days to ~/logs/archive/
#  Usage:  bash scripts/rotate-logs.sh [--days=7] [--dry-run]
# ═══════════════════════════════════════════════════════════
set -euo pipefail

DAYS=7
DRY=""
for arg in "$@"; do
  case "$arg" in
    --days=*) DAYS="${arg#*=}" ;;
    --dry-run) DRY="--dry-run" ;;
  esac
done

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
LOG_DIR="$HOME/logs"
ARCHIVE_DIR="$LOG_DIR/archive/$(date +%Y-%m-%d)"
SIZE_BEFORE=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1 || echo "0B")

echo -e "${CYAN}═══ ZES Log Rotation ═══${NC}"
echo "  Log dir:  $LOG_DIR"
echo "  Archive:  $ARCHIVE_DIR"
echo "  Age:      >${DAYS} days"
echo "  Size now: $SIZE_BEFORE"
[ -n "$DRY" ] && echo -e "  ${YELLOW}DRY RUN — no files moved${NC}"
echo ""

for svc_dir in "$LOG_DIR"/*/; do
  [ "$(basename "$svc_dir")" = "archive" ] && continue
  count=$(find "$svc_dir" -maxdepth 1 -type f -name "*.log" -mtime +$DAYS 2>/dev/null | wc -l)
  [ "$count" -eq 0 ] && continue
  echo "  $(basename "$svc_dir"): $count log(s) to archive"
  if [ -z "$DRY" ]; then
    mkdir -p "$ARCHIVE_DIR/$(basename "$svc_dir")"
    find "$svc_dir" -maxdepth 1 -type f -name "*.log" -mtime +$DAYS -exec mv {} "$ARCHIVE_DIR/$(basename "$svc_dir")/" \;
  fi
done

if [ -z "$DRY" ]; then
  SIZE_AFTER=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1 || echo "0B")
  echo ""
  echo -e "${GREEN}✅ Rotation complete: $SIZE_BEFORE → $SIZE_AFTER${NC}"
  echo "  Archived logs: $ARCHIVE_DIR"
else
  echo ""
  echo -e "${YELLOW}Dry run complete — pass without --dry-run to execute${NC}"
fi
