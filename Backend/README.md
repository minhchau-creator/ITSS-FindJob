# Đã xong API cho môn ITSS2,Mọi người code FE chú ý nhé,chỗ lọc công việc hơi phức tạp,truyền lên đúng định dạng URL nhé,chứ đừng chỉ copy URL rồi dán lên,như vậy nó không lấy ra hết được các trường hợp đâu.

# Cách clone dự án về máy tính

```c
   https://github.com/minhchau-creator/ITSS-FindJob.git
```

# Cách chạy MongoDB local

1. Cài MongoDB Community Server trên máy.
2. Đảm bảo MongoDB đang chạy ở `mongodb://127.0.0.1:27017`.
3. Mở MongoDB Compass hoặc ứng dụng khác rồi kết nối bằng chuỗi sau:
   ```c
      mongodb://127.0.0.1:27017/ITSS2
   ```

# Nạp mock data

Chạy lệnh sau trong thư mục `ITSS2-Backend`:

```c
   npm run seed
```

Lệnh này sẽ xóa dữ liệu cũ trong collection `Jobs` và `Users`, sau đó nạp lại bộ mock dữ liệu mới.

# API

1. Lấy danh sách các công việc(GET)

    http://localhost:8080/api/v1/jobs

2.Lấy thông tin chi tiết công việc(GET) mọi người lấy ID rồi gửi lên url nhé(kia là ID mẫu để test thui)

    http://localhost:8080/api/v1/jobs/detail/681ea42f2d17ecbbb9479b23

3.  Lọc theo nhiều tiêu chí(GET) Gửi lên đúng như này nha

        http://localhost:8080/api/v1/jobs?jobForm=Làm thêm,Contract&jobType=Part-Time,Full-Time

    \*\*\*API để test thêm phần này

         http://localhost:8080/api/v1/jobs?jobForm=Làm thêm&jobType=Part-Time&category=Gia sư

         http://localhost:8080/api/v1/jobs?jobForm=Contract&jobType=Part-Time&category=Gia sư,Sales&days=Thứ 2,Thứ 4,Thứ 5

4.  Lọc theo khoảng lương từ bao nhiêu đến bao nhiêu

         http://localhost:8080/api/v1/jobs?minSalary=200000&maxSalary=500000

5.  Sort theo mức lương và ngày mới nhất tạo công việc

           http://localhost:8080/api/v1/jobs?sortKey=salary&sortValue=desc

           http://localhost:8080/api/v1/jobs?sortKey=startDate&sortValue=asc

    6.Lấy ra địa chỉ công việc

         http://localhost:8080/api/v1/address

    7.Phân trang sản phẩm

         http://localhost:8080/api/v1/jobs?page=1&limit=6

    8.Tìm kiếm sản phẩn theo Keywork (tìm theo category job) và địa chỉ

        http://localhost:8080/api/v1/jobs?keyword=Nhân viên bán hàng&address= Trần Đại Nghĩa

    9.Lọc công việc theo thơi gian rảnh của khách hàng

         http://localhost:8080/api/v1/jobs?jobType=Part-Time&category=Gia sư,Dịch vụ&available=Thứ 2-tối,Thứ 5-tối,Thứ 7-sáng

    API test thêm

         http://localhost:8080/api/v1/jobs?jobType=Part-Time&category=Gia sư&available=Thứ 2-tối,Thứ 5-tối

6.  Lấy ra thông tin người dùng:
    
         [GET]/api/v1/users/:id

7.  Cập nhật thông tin người dùng:

         [POST]/api/v1/users/:id

      ``` json 
      {
         "name": "Pham Hoang Hai Nam",
         "address": "Ha Noi",
         "major": "IT",
         "university": "HUST",
         "jobType": "Part-Time",
         "jobForm": "Internship",
         "category": "Gia sư",
         "phone": "0123456789",
         "workingSchedule": [
            {
            "day": "Thứ 5",
            "period": "sáng"
            },
            {
            "day": "Thứ 6",
            "period": "sáng"
            }
         ]
      }
      
      Note: Chỉ có name là bắt buộc có, mấy cái thông tin khác có hay không không quan trọng, quan trọng là nếu không có thì không suggest ra cái công việc gì được đâu.

8.  Lấy ra công việc phù hợp:
    
         [GET]/api/v1/users/:id/suggested-jobs

9. Lấy ra danh sách mấy cái cần lấy:

        [GET]/api/v1/users/:id/get-jtype-list -> lấy ra jobType 

        [GET]/api/v1/users/:id/get-jform-list -> lấy ra jobForm

        [GET]/api/v1/users/:id/get-category-list -> lấy ra category

10. USER_ID:
    
        682b71380c69774bd1f056bd
