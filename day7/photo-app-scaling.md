# SnapShare: Photo-App Scaling Plan

## 1. Assumptions

- There are **10,000,000 registered users**.
- **10% are active daily**, giving 10,000,000 × 0.10 = **1,000,000 daily active users (DAU)**.
- Each daily active user uploads **1 photo per day** and views **50 feed pages per day**.
- Each original photo averages **2 MB** and each generated thumbnail averages **50 KB**.
- Use **86,400 seconds per day** and **365 days per year**. For storage estimates, use decimal units (1 TB = 1,000 GB).
- Feed views are page requests, not individual photo-image requests. A single feed page can trigger several CDN image requests, so total image delivery traffic will be higher.
- The calculations are daily averages. Peak feed views are estimated at **5× the daily average**. Storage estimates include one copy of originals and thumbnails, excluding replicas, backups, metadata, logs, and overhead.

## 2. Capacity estimates

### Daily active users

10,000,000 registered users × 10% active = **1,000,000 DAU**.

### Uploads per second

- Uploads per day: 1,000,000 DAU × 1 photo = **1,000,000 photos/day**.
- Average uploads per second: 1,000,000 ÷ 86,400 = **11.57 uploads/second**, or about **12 uploads/second**.

### Feed views per second

- Feed views per day: 1,000,000 DAU × 50 pages = **50,000,000 feed views/day**.
- Average feed views per second: 50,000,000 ÷ 86,400 = **578.70 views/second**, or about **579 views/second**.
- Estimated peak at 5× average: 578.70 × 5 = **2,893.52 views/second**, or about **2,894 views/second**.

This peak is a planning estimate, not a guarantee; real traffic should be measured and load-tested.

### Photo storage per year

- Original photos: 1,000,000 photos/day × 2 MB × 365 = **730,000,000 MB/year = 730 TB/year**.
- Thumbnails: 1,000,000 photos/day × 50 KB × 365 = **18,250,000,000 KB/year = 18.25 TB/year**.
- Combined original and thumbnail storage: **748.25 TB/year**, before replicas, backups, metadata, and operational overhead.

This assumes every photo is retained and each daily active user uploads one photo each day. Storage grows by roughly **2.05 TB/day**.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy by request count**: it receives 50 million feed-page views per day compared with 1 million photo uploads per day, or about **50 feed views per upload**. The design should optimize feed reads and image delivery: cache frequently requested feed data, serve images through a CDN, and send eligible read queries to a database read replica. Writes still need reliable handling because uploaded photos and their metadata must not be lost; the thumbnail queue also absorbs bursts of background work.

## 4. Why photos belong in object storage, not the database

Original photos and thumbnails are large binary files. Storing them directly in a relational database makes database storage, backups, replication, and queries heavier and more expensive. Store the image files in **object storage** (for example, an S3-compatible or cloud blob store) and keep only metadata and object keys/URLs in the database. A CDN can cache and deliver the files close to users, reducing latency and taking image traffic away from app servers and the database.

## 5. Architecture diagram

```text
                         +----------------------+
                         |     Mobile / Web     |
                         |       Clients        |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         |         CDN          |
                         | Cached photos/thumbs |
                         +----+------------+----+
                              | cache miss  | image delivery
                              v             +--------------------+
                    +--------------------+                       |
                    |   Load Balancer    |                       |
                    +---------+----------+                       |
                              |                                  |
                    +---------v----------+                       |
                    |    App Servers     |                       |
                    | API / auth / feed  |                       |
                    +--+--------+-----+--+                       |
                       |        |     |                          |
                 feed/cache     |     +--- upload authorization -+
                       |        |
                 +-----v----+   | metadata
                 |   Cache  |   v
                 | feed/data| +-----------------------+
                 +----------+ | Primary Database     |
                              | users, posts, keys   |
                              +-----------+-----------+
                                          |
                                          | replication
                                          v
                              +-----------------------+
                              | Database Read Replica|
                              +-----------------------+

 Client uploads the photo directly using a short-lived upload URL
                         |
                         v
              +-------------------------+
              |      Object Storage     |
              | Originals + thumbnails |
              +------------+------------+
                           ^
                           | writes thumbnail
                 +---------+----------+
                 |  Thumbnail Worker  |
                 +---------+----------+
                           ^
                           | consumes job
                    +------+------+
                    |    Queue     |
                    | thumbnail job|
                    +------+------+
                           ^
                           | enqueue after upload
                       App Servers

 CDN fetches image objects from object storage on a cache miss.
```

## 6. What each component does

- **Mobile/Web clients:** Let users upload photos and request their feed from a phone or browser.
- **CDN:** Caches and serves photos and thumbnails from edge locations so repeated image requests do not all reach origin storage.
- **Load balancer:** Distributes API requests across healthy app-server instances instead of sending all traffic to one server.
- **App servers:** Handle authentication, feed logic, upload authorization, metadata updates, and job creation without serving large image bytes themselves.
- **Cache:** Keeps frequently requested feed results and other short-lived data in fast memory to reduce repeated database reads.
- **Primary database:** Stores durable structured records such as users, follows, posts, photo object keys, and timestamps.
- **Database read replica:** Serves eligible read queries to reduce read pressure on the primary database; replication may lag slightly behind writes.
- **Object storage:** Durably stores original image files and generated thumbnails independently of the relational database.
- **Queue:** Buffers thumbnail jobs so uploads can finish without waiting for image processing and bursts can be processed later.
- **Thumbnail worker:** Consumes queued jobs, creates resized/compressed thumbnails, stores them in object storage, and updates processing status if needed.

## 7. Photo upload flow

1. **Request upload:** The client asks an app server to start an upload; the server authenticates the user and checks upload limits.
2. **Authorize storage upload:** The app server creates a photo/post record in a pending state and returns a short-lived, restricted upload URL or equivalent authorization for object storage.
3. **Upload original:** The client uploads the 2 MB original directly to object storage, avoiding routing the entire file through an app server.
4. **Confirm upload:** The client notifies the app server, or storage emits an upload event; the server verifies the object exists and marks the original as uploaded.
5. **Queue thumbnail work:** The app server publishes a thumbnail job containing the photo ID and object key to the queue. The feed can show a processing state or placeholder until the thumbnail is ready.
6. **Generate thumbnail:** A thumbnail worker consumes the job, reads the original object, validates/processes it, and creates a roughly 50 KB thumbnail.
7. **Store and update:** The worker writes the thumbnail to object storage and updates photo metadata/status in the primary database. The queue should support retries and dead-letter handling for repeated failures.
8. **Serve the photo:** Feed requests read post metadata from cache/database, while the CDN serves the original or thumbnail from cache; on a cache miss, it fetches the object from storage.

## 8. Trade-offs

### Object storage + CDN vs. storing files in the database

**Benefit:** Object storage scales naturally for large files, while the CDN reduces latency and origin traffic. **Cost:** The system must manage object keys, access permissions, cache invalidation, and cleanup if a database record is deleted or an upload fails.

### Cache and read replica vs. reading everything from the primary database

**Benefit:** Cache and replicas improve feed throughput and protect the primary database during read spikes. **Cost:** Cached results can be stale, and a read replica can lag behind the primary, so a newly uploaded photo may not appear immediately in every feed path. Cache invalidation and routing rules add complexity.

### Asynchronous thumbnail queue vs. processing thumbnails during upload

**Benefit:** Users do not have to wait for thumbnail processing before the upload request completes, and workers can scale independently. **Cost:** Thumbnail availability is eventually consistent; jobs can fail or be delivered more than once, so workers need retries, monitoring, and idempotent processing.

### Direct-to-object-storage upload vs. proxying every upload through app servers

**Benefit:** Direct uploads save app-server bandwidth and CPU. **Cost:** Upload authorization, completion confirmation, abandoned partial uploads, file validation, and abuse prevention need deliberate handling.

## 9. Scaling priorities

Monitor upload rate, feed latency, cache hit rate, database CPU and replica lag, queue depth and job age, CDN hit rate, and object-storage growth. Load-test at least the estimated **2,894 feed views/second** peak, with additional headroom for image requests and traffic bursts. Scale app servers and thumbnail workers horizontally, and consider more advanced feed architecture only when measurements show the simpler design is reaching its limits.
