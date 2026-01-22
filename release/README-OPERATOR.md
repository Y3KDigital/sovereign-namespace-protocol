# kevan-os — Operator Guide

## Run
kevan-os <module> <command> [args]

## Examples
kevan-os calendar add --title "Event" --time "2026-01-17T18:00:00"
kevan-os tel call --to "+1..." --from "+1..."
kevan-os finance history
kevan-os mail inbox

## Logs
All actions emit immutable events via the hub.

## Demo Mode
To validate the system with a scripted "Day in the Life" simulation:
```powershell
# If scripts are disabled on your system, run this first:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run the demo
.\run_demo.ps1
```

## Observer Mode (Read-Only)
For non-operators, auditors, and witnesses. No keys required. No state changes allowed.
```powershell
# Run the Observer dashboard
.\run_observer.ps1

# Or run manual commands
.\kevan-os.exe --observer status
.\kevan-os.exe --observer audit tail
```

## Status
Production-ready. Behavior frozen under v1.0.0.
Observer extensions added in v1.0.1.
