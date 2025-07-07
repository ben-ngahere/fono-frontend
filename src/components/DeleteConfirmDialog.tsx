interface DeleteConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

const DeleteConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting && (
              <i
                className="fas fa-spinner fa-spin text-sm"
                aria-hidden="true"
              ></i>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmDialog
