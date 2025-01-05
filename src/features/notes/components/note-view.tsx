import Sidebar from '@/features/notes/components/sidebar-notes';

const NoteView = () => {
  return (
    <div className="flex">
      <div className="w-1/4">
        <Sidebar />
      </div>
      <div className="w-3/4 p-4">
        <h2 className="text-xl font-semibold">Notes</h2>
        <p>Here you can add or view notes related to the project.</p>
      </div>
    </div>
  );
};

export default NoteView;
