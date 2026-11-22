# Project documentation

| Location | Purpose |
| --- | --- |
| [Main README](../README.md) | Project overview, team details, architecture and current run commands |
| [Replit guide](replit.md) | Development and deployment entry points |
| [Architecture](architecture.md) | Runtime services, data paths and provider boundaries |
| [Render deployment](render-deployment.md) | Separate game/chatbot services, fixed webhook and storage choices |
| [Upstream provenance](reference/README.md) | Origin and licence of the folio-2025 foundation |
| [Technical stack](technical-stack-and-diagram-prompt.md) | Supporting technical explanation |
| [RunPod guide](../runpod/README.md) | Inference endpoint configuration |
| [Tests](../tests/README.md) | Automated test categories and commands |

Runtime datasets are split between root `data/` and `src/data/` to preserve their
existing loading paths. Application code stays in `src/`, while documentation
and upstream provenance stay here. Historical evidence is retained
as recorded; moving it is not a new verification run. Private `.env`, player saves
and chatbot databases are excluded from version control.
