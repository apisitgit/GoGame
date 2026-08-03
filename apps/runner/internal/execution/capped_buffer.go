package execution

import "bytes"

type cappedBuffer struct {
	limit     int
	buffer    bytes.Buffer
	truncated bool
}

func newCappedBuffer(limit int) *cappedBuffer {
	return &cappedBuffer{limit: limit}
}

func (writer *cappedBuffer) Write(payload []byte) (int, error) {
	if writer.limit <= 0 {
		writer.truncated = true
		return len(payload), nil
	}

	remaining := writer.limit - writer.buffer.Len()
	if remaining <= 0 {
		writer.truncated = true
		return len(payload), nil
	}

	if len(payload) > remaining {
		writer.truncated = true
		_, _ = writer.buffer.Write(payload[:remaining])
		return len(payload), nil
	}

	_, _ = writer.buffer.Write(payload)
	return len(payload), nil
}

func (writer *cappedBuffer) String() string {
	return writer.buffer.String()
}

func (writer *cappedBuffer) Truncated() bool {
	return writer.truncated
}
