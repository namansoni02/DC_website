import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Spin, Row, Col, Card, Typography, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "../styles/ProfilePage.css";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const res = await axios.get("/api/v1/user/getUserData", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success) {
          setUserData(res.data.data);
        } else {
          console.error("Error fetching user profile data");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, []);

  return (
    <Layout>
      <div className="profile-container">
        <Row justify="center" className="profile-header">
          <Col xs={24} sm={16} md={12} className="profile-title-container">
            <Avatar
              size={100}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <Title level={2} className="profile-title">
              {userData?.name || "Your Profile"}
            </Title>
          </Col>
        </Row>

        <Row justify="center" className="profile-info-container">
          {loading ? (
            <Spin size="large" className="loading-spinner" />
          ) : (
            userData && (
              <Col xs={24} sm={16} md={12}>
                <Card
                  title={<Title level={4}>Profile Information</Title>}
                  bordered={false}
                  className="profile-card"
                >
                  <p>
                    <Text strong>Name:</Text> {userData.name}
                  </p>
                  <p>
                    <Text strong>Email:</Text> {userData.email}
                  </p>
                  <p>
                    <Text strong>Contact:</Text> {userData.contact || "N/A"}
                  </p>
                  <p>
                    <Text strong>Specialization:</Text>{" "}
                    {userData.specialization || "N/A"}
                  </p>
                </Card>
              </Col>
            )
          )}
        </Row>
      </div>
    </Layout>
  );
};

export default ProfilePage;
