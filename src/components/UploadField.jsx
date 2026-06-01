const UploadField = ({ label, onChange, uploading, preview }) => (
  <label className="upload-field">
    <span>{label}</span>
    <input type="file" accept="image/*" onChange={onChange} disabled={uploading} />
    {uploading && <div className="upload-progress"><span /></div>}
    {preview && <img src={preview} alt="Upload preview" loading="lazy" />}
  </label>
);

export default UploadField;
